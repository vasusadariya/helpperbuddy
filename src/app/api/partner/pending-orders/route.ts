import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const ORDER_WINDOW_HOURS = 48;
console.log("ORDER_WINDOW_HOURS", ORDER_WINDOW_HOURS);
console.log("DEFAULT_PAGE_SIZE", DEFAULT_PAGE_SIZE);
console.log("MAX_PAGE_SIZE", MAX_PAGE_SIZE);
export async function GET() {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Get partner details
    const partner = await prisma.partner.findFirst({
      where: { 
        email: session.user.email,
        approved: true,
        isActive: true
      },
      select: {
        id: true,
        ServiceProvider: {
          where: { isActive: true },
          select: {
            serviceId: true
          }
        },
        PartnerPincode: {
          where: { isActive: true },
          select: {
            pincode: true
          }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: "Partner not found or not approved",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    const serviceIds = partner.ServiceProvider.map(sp => sp.serviceId);
    const pincodes = partner.PartnerPincode.map(pp => pp.pincode);

    // Get pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        AND: [
          { serviceId: { in: serviceIds } },
          { pincode: { in: pincodes } },
          { status: 'PENDING' },
          { partnerId: null }
        ]
      },
      include: {
        service: {
          select: {
            name: true,
            category: true,
            price: true,
            description: true
          }
        },
        user: {
          select: {
            name: true,
            phoneno: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    // Format orders
    const formattedOrders = pendingOrders.map(order => ({
      id: order.id,
      serviceDetails: {
        name: order.service.name,
        category: order.service.category,
        price: order.service.price,
        description: order.service.description
      },
      customerDetails: {
        name: order.user.name,
        phone: order.user.phoneno || 'Will be shared after acceptance'
      },
      orderDetails: {
        date: order.date.toISOString().split('T')[0],
        time: order.time,
        address: order.address,
        pincode: order.pincode,
        amount: order.amount,
        remarks: order.remarks || null
      },
      timestamps: {
        created: order.createdAt.toISOString(),
        updated: order.updatedAt.toISOString()
      }
    }));

    // Update last active timestamp
    await prisma.partner.update({
      where: { id: partner.id },
      data: { lastActiveAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("[Pending Orders Error]:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch pending orders",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}