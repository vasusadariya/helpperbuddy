import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { authOptions } from "../../auth/[...nextauth]/options";

interface VerifyRequestBody {
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export async function POST(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Get request body
    const body: VerifyRequestBody = await req.json();
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    // Verify the order belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: {
          email: session.user.email
        }
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Generate signature verification string
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // Verify signature
    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({
        success: false,
        error: "Invalid payment signature",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Update order status to PAYMENT_COMPLETED
    // Note: The actual order completion will be handled by the webhook
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAYMENT_COMPLETED",
        razorpayPaymentId,
        paidAt: new Date(currentUTCTime),
        updatedAt: new Date(currentUTCTime)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Payment verified successfully",
        orderId,
        paymentId: razorpayPaymentId,
        serviceName: order.service.name,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("[Payment Verify API Error]:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: currentUTCTime
    });

    return NextResponse.json({
      success: false,
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}