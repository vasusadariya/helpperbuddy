import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { apiResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Extract orderId from URL path
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const orderId = pathParts[pathParts.length - 2]; // Assuming path is /api/orders/[orderId]/status
  
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return apiResponse({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, 401);
    }

    if (!orderId) {
      return apiResponse({
        success: false,
        error: "Order ID is required",
        timestamp: currentUTCTime
      }, 400);
    }

    // Fetch order with all necessary details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: {
          select: {
            name: true,
            price: true,
            category: true,
            description: true
          }
        },
        Partner: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneno: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phoneno: true
          }
        },
        transaction: {
          select: {
            id: true,
            amount: true,
            type: true,
            createdAt: true
          }
        }
      }
    });

    if (!order) {
      return apiResponse({
        success: false,
        error: "Order not found",
        orderIdReceived: orderId,
        timestamp: currentUTCTime
      }, 404);
    }

    // Check if user has permission to view this order
    const isCustomer = order.user.email === session.user.email;
    const isPartner = order.Partner?.email === session.user.email;

    if (!isCustomer && !isPartner) {
      return apiResponse({
        success: false,
        error: "Unauthorized to view this order",
        timestamp: currentUTCTime
      }, 403);
    }

    // Format order data
    const orderData = {
      id: order.id,
      status: order.status,
      paymentDetails: {
        amount: order.amount,
        remainingAmount: order.remainingAmount,
        walletAmount: order.walletAmount,
        currency: order.currency,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        paidAt: order.paidAt?.toISOString(),
      },
      serviceDetails: {
        name: order.service.name,
        category: order.service.category,
        price: order.service.price,
        description: order.service.description
      },
      partnerDetails: order.Partner ? {
        name: order.Partner.name,
        phone: order.Partner.phoneno,
        // Only include partner email for the partner themselves
        email: isPartner ? order.Partner.email : undefined
      } : null,
      customerDetails: {
        name: order.user.name,
        // Only include customer details for the customer themselves
        email: isCustomer ? order.user.email : undefined,
        phone: isCustomer ? order.user.phoneno : undefined
      },
      orderDetails: {
        date: order.date.toISOString().split('T')[0], // YYYY-MM-DD
        time: order.time,
        address: order.address,
        pincode: order.pincode,
        remarks: order.remarks
      },
      timestamps: {
        created: order.createdAt.toISOString(),
        updated: order.updatedAt.toISOString(),
        accepted: order.acceptedAt?.toISOString(),
        started: order.startedAt?.toISOString(),
        completed: order.completedAt?.toISOString(),
        cancelled: order.cancelledAt?.toISOString(),
        paymentRequested: order.paymentRequestedAt?.toISOString()
      },
      transaction: order.transaction ? {
        id: order.transaction.id,
        amount: order.transaction.amount,
        type: order.transaction.type,
        createdAt: order.transaction.createdAt.toISOString()
      } : null
    };

    return apiResponse({
      success: true,
      data: orderData,
      timestamp: currentUTCTime
    });

  } catch (error) {
    console.error("[Order Status Error]:", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error',
      orderId,
      timestamp: currentUTCTime,
      user: (await getServerSession(authOptions))?.user?.email
    });

    return apiResponse({
      success: false,
      error: "Failed to fetch order status",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, 500);
  }
}