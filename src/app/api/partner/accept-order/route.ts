import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";
import { sendOrderAcceptanceEmail } from "../../services/emailServices/route";

interface OrderAcceptanceEmailData {
  orderId: string;
}


export async function POST(request: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let session;

  try {
    // Validate session
    session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Get and validate request body
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
    const partner = await prisma.partner.findFirst({
      where: {
        email: session.user.email,
        approved: true,
        isActive: true
      },
      include: {
        serviceProvider: {
          where: { isActive: true },
          include: { Service: true }
        },
        partnerPincode: {
          where: { isActive: true }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: "Partner not found or not approved",
        timestamp: currentUTCTime
      }, { status: 403 });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get order with current state
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          service: true,
          user: true
        }
      });

      // Validate order exists
      if (!order) {
        throw new Error("Order not found");
      }

      // Validate order is still pending
      if (order.status !== 'PENDING') {
        throw new Error("Order is no longer available for acceptance");
      }

      // Validate order hasn't been taken
      if (order.partnerId) {
        throw new Error("Order has already been accepted by another partner");
      }

      // Validate partner can service this order
      const canService = partner.serviceProvider.some(sp => 
        sp.serviceId === order.serviceId && sp.isActive
      );
      
      const canServiceArea = partner.partnerPincode.some(pp => 
        pp.pincode === order.pincode && pp.isActive
      );

      if (!canService || !canServiceArea) {
        throw new Error("Partner is not eligible to accept this order");
      }

      // Update the order
      const updatedOrder = await tx.order.update({
        where: { 
          id: orderId,
          status: 'PENDING',  // Extra safety check
          partnerId: null     // Extra safety check
        },
        data: {
          partnerId: partner.id,
          status: 'ACCEPTED',
          acceptedAt: new Date()
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
              email: true,
              phoneno: true
            }
          }
        }
      });

      // Update partner's last active timestamp
      await tx.partner.update({
        where: { id: partner.id },
        data: { lastActiveAt: new Date() }
      });

      return updatedOrder;
    });

    // Send email notification
    const emailResult = await sendOrderAcceptanceEmail({
      orderId: result.id
    });

    if (!emailResult.success) {
      console.error('Failed to send order acceptance email:', emailResult.error);
    }

    // Format the response
    const response = {
      id: result.id,
      serviceDetails: {
        name: result.service.name,
        category: result.service.category,
        price: result.service.price,
        description: result.service.description
      },
      customerDetails: {
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phoneno || 'Not provided'
      },
      orderDetails: {
        date: result.date.toISOString().split('T')[0],
        time: result.time,
        address: result.address,
        pincode: result.pincode,
        amount: result.amount,
        remarks: result.remarks || null,
        status: result.status,
        acceptedAt: result.acceptedAt?.toISOString()
      },
      emailNotification: {
        sent: emailResult.success,
        error: emailResult.success ? null : emailResult.error
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        order: response,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("[Accept Order Error]:", {
      timestamp: currentUTCTime,
      user: session?.user?.email,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });

    // Determine appropriate error message and status
    let statusCode = 500;
    let errorMessage = "Failed to accept order";

    if (error instanceof Error) {
      switch (error.message) {
        case "Order not found":
          statusCode = 404;
          errorMessage = "Order not found";
          break;
        case "Order is no longer available for acceptance":
        case "Order has already been accepted by another partner":
          statusCode = 409; // Conflict
          errorMessage = error.message;
          break;
        case "Partner is not eligible to accept this order":
          statusCode = 403;
          errorMessage = error.message;
          break;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: statusCode });
  }
}