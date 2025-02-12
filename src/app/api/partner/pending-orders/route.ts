import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Get partner details with their services and pincodes in a single query
    const partner = await prisma.partner.findUnique({
      where: { 
        email: session.user.email,
        approved: true, // Only approved partners can see orders
        isActive: true  // Only active partners can see orders
      },
      include: {
        serviceProvider: {
          where: {
            isActive: true // Only include active service associations
          },
          select: { 
            serviceId: true 
          }
        },
        partnerPincode: {
          where: {
            isActive: true // Only include active pincode associations
          },
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

    const serviceIds = partner.serviceProvider.map(sp => sp.serviceId);
    const pincodes = partner.partnerPincode.map(pp => pp.pincode);

    if (serviceIds.length === 0 || pincodes.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          orders: [],
          message: serviceIds.length === 0 ? 
            "No services associated with partner" : 
            "No service areas configured",
          timestamp: currentUTCTime
        }
      });
    }

    // Get pending orders for these services in partner's service areas
    const pendingOrders = await prisma.order.findMany({
      where: {
        AND: [
          {
            serviceId: { 
              in: serviceIds 
            }
          },
          {
            pincode: {
              in: pincodes
            }
          },
          {
            status: 'PENDING'
          },
          {
            partnerId: null
          },
          {
            date: {
              gte: new Date() // Only show future orders
            }
          }
        ]
      },
      include: {
        service: {
          select: {
            name: true,
            price: true,
            category: true,
            description: true
          }
        },
        user: {
          select: {
            name: true,
            phoneno: true // Include customer phone for service coordination
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Format the response data
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
        phone: order.user.phoneno || 'Not provided'
      },
      orderDetails: {
        date: order.date.toISOString().split('T')[0], // YYYY-MM-DD
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

    // Update partner's last active timestamp
    await prisma.partner.update({
      where: { id: partner.id },
      data: { lastActiveAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        meta: {
          total: formattedOrders.length,
          serviceAreas: pincodes.length,
          services: serviceIds.length
        },
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    const session = await getServerSession(authOptions);
    console.error("[Pending Orders Error]:", {
      error,
      timestamp: currentUTCTime,
      user: session?.user?.email,
      errorDetails: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      error: "Failed to fetch pending orders",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}