import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(
  req: NextRequest,
  context: { params: { orderId: string } }
) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const orderId = context.params.orderId;

  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Get user with wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wallet: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Get order details
    const order = await prisma.order.findFirst({
        where: {
          id: orderId, // Use extracted orderId here
          userId: user.id,
        },
        include: {
          service: {
            select: {
              name: true,
              description: true,
            },
          },
        },
      });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Calculate amounts
    const walletBalance = user.wallet?.balance ?? 0;
    const totalAmount = order.amount;
    const walletAmount = Math.min(walletBalance, totalAmount); // Use wallet amount up to total amount
    const remainingAmount = totalAmount - walletAmount; // Calculate remaining after wallet deduction

    // If payment is already completed
    if (order.status === "COMPLETED" || order.status === "PAYMENT_COMPLETED") {
      return NextResponse.json({
        success: true,
        data: {
          status: "COMPLETED",
          timestamp: currentUTCTime
        }
      });
    }

    // Create Razorpay order for remaining amount
    let razorpayOrder = null;
    if (remainingAmount > 0) {
      razorpayOrder = await razorpay.orders.create({
        amount: remainingAmount * 100, // Convert to paise
        currency: "INR",
        receipt: order.id,
        notes: {
          orderId: order.id,
          userEmail: session.user.email,
        },
      });

      // Update order with wallet amount to be used
      await prisma.order.update({
        where: { id: order.id },
        data: {
          walletAmount: walletAmount,
          remainingAmount: remainingAmount,
          updatedAt: new Date(currentUTCTime)
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        totalAmount: totalAmount,
        walletBalance: walletBalance,
        walletAmount: walletAmount, // Amount that will be deducted from wallet
        remainingAmount: remainingAmount, // Amount to be paid via Razorpay
        status: order.status,
        razorpayOrderId: razorpayOrder?.id,
        razorpayAmount: razorpayOrder ? remainingAmount * 100 : 0, // in paise
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        serviceDetails: {
          name: order.service.name,
          description: order.service.description ?? "",
        },
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("[Payment Initiate API Error]:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: currentUTCTime,
      orderId: orderId
    });

    return NextResponse.json({
      success: false,
      error: "Failed to initiate payment",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}