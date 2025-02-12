import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Order ID is required",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Get partner details
    const partner = await prisma.partner.findUnique({
      where: { email: session.user.email },
      include: {
        serviceProvider: true,
        partnerPincode: true
      }
    });

    if (!partner || !partner.approved) {
      return NextResponse.json({
        success: false,
        error: "Partner not found or not approved",
        timestamp: currentUTCTime
      }, { status: 403 });
    }

    // Try to accept the order using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First, check if the order is still available
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          service: true
        }
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== 'PENDING' || order.partnerId) {
        throw new Error("Order is no longer available");
      }

      // Verify partner eligibility
      const isServiceProvider = partner.serviceProvider.some(
        sp => sp.serviceId === order.serviceId
      );
      const servesLocation = partner.partnerPincode.some(
        pp => pp.pincode === order.pincode
      );

      if (!isServiceProvider || !servesLocation) {
        throw new Error("Partner not eligible for this order");
      }

      // Update the order
      const updatedOrder = await tx.order.update({
        where: { 
          id: orderId,
          status: 'PENDING',  // Additional check
          partnerId: null     // Ensure no other partner has accepted
        },
        data: {
          partnerId: partner.id,
          status: 'ACCEPTED'
        },
        include: {
          service: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      return updatedOrder;
    });

    // Send notification to user (implement your notification system)
    // await sendOrderAcceptedNotification(result.user.email, {
    //   orderId: result.id,
    //   serviceName: result.service.name,
    //   partnerName: partner.name,
    //   partnerPhone: partner.phoneno
    // });

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.id,
        serviceName: result.service.name,
        customerName: result.user.name,
        address: result.address,
        pincode: result.pincode,
        date: result.date,
        time: result.time,
        amount: result.amount,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("Error accepting order:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept order",
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}