import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PrismaClient, Transaction, Wallet, Order } from "@prisma/client";
import crypto from "crypto";

// Constants
const REFERRAL_BONUS_AMOUNT = 50;
const CURRENCY = "INR";

// Configuration
const prisma = new PrismaClient();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Types
type ReferralResult = {
  wallet: Wallet;
  transaction: Transaction;
} | null;

type WebhookEvent = {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        error_description?: string;
      };
    };
  };
};

async function processReferralBonus(orderId: string): Promise<ReferralResult> {
  try {
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            referrer: {
              include: {
                wallet: true
              }
            }
          }
        }
      }
    });

    const referrerWallet = orderWithDetails?.user?.referrer?.wallet;
    const referrerId = orderWithDetails?.user?.referrer?.id;
    const userId = orderWithDetails?.userId;

    if (!referrerWallet || !referrerId || !userId) {
      console.log(`No valid referral chain found for order: ${orderId}`);
      return null;
    }

    // Check if this is the user's first completed order
    const previousCompletedOrders = await prisma.order.count({
      where: {
        userId: userId,
        status: 'COMPLETED',
        id: { not: orderId }
      }
    });

    if (previousCompletedOrders > 0) {
      console.log(`Not first order for user ${userId}, skipping referral bonus`);
      return null;
    }

    // Check if referrer has already received bonus for this user
    const existingBonus = await prisma.transaction.findFirst({
      where: {
        userId: referrerId,
        type: 'REFERRAL_BONUS',
        description: {
          contains: `Referral bonus for user ${userId}`
        }
      }
    });

    if (existingBonus) {
      console.log(`Referral bonus already paid to referrer ${referrerId} for user ${userId}`);
      return null;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: referrerWallet.id },
        data: {
          balance: { increment: REFERRAL_BONUS_AMOUNT }
        }
      });

      const bonusTransaction = await tx.transaction.create({
        data: {
          amount: REFERRAL_BONUS_AMOUNT,
          type: 'REFERRAL_BONUS',
          description: `Referral bonus for user ${userId}'s first order #${orderId}`,
          walletId: referrerWallet.id,
          userId: referrerId
        }
      });

      return { wallet: updatedWallet, transaction: bonusTransaction };
    });

    console.log(`Referral bonus processed for first-time order: ${orderId}`, {
      referrerId,
      userId,
      amount: REFERRAL_BONUS_AMOUNT
    });
    
    return result;

  } catch (error) {
    console.error(`Error processing referral bonus for order ${orderId}:`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const isTestMode = process.env.NODE_ENV === 'development';
    
    if (!isTestMode) {
      if (!signature) {
        return NextResponse.json({
          success: false,
          error: "No signature provided",
          timestamp: currentUTCTime
        }, { status: 400 });
      }

      // Verify signature
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json({
          success: false,
          error: "Invalid signature",
          timestamp: currentUTCTime
        }, { status: 400 });
      }
    }

    const event = JSON.parse(body) as WebhookEvent;
    console.log("Webhook event received:", {
      event_type: event.event,
      timestamp: currentUTCTime,
      order_id: event.payload?.payment?.entity?.order_id
    });

    if (event.event === "payment.captured") {
      const { id: paymentId, order_id: razorpayOrderId } = event.payload.payment.entity;

      const order = await prisma.order.findUnique({
        where: { razorpayOrderId },
        include: {
          service: true,
          user: true
        }
      });

      if (!order) {
        console.error(`Order not found: ${razorpayOrderId}`);
        return NextResponse.json({
          success: false,
          error: "Order not found",
          timestamp: currentUTCTime
        }, { status: 404 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { 
            status: "COMPLETED",
            razorpayPaymentId: paymentId,
            paidAt: new Date(currentUTCTime),
            updatedAt: new Date(currentUTCTime)
          }
        });

        const referralResult = await processReferralBonus(order.id);

        return {
          order: updatedOrder,
          referralResult
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          message: "Payment processed successfully",
          order: {
            id: result.order.id,
            status: result.order.status,
            amount: order.remainingAmount,
            service: order.service.name
          },
          paymentId,
          timestamp: currentUTCTime,
          ...(result.referralResult && {
            referralBonus: {
              amount: REFERRAL_BONUS_AMOUNT,
              transaction: result.referralResult.transaction
            }
          })
        }
      });
    }

    if (event.event === "payment.failed") {
      const { order_id: razorpayOrderId, error_description } = event.payload.payment.entity;
      
      const order = await prisma.order.update({
        where: { razorpayOrderId },
        data: { 
          status: "PENDING",
          updatedAt: new Date(currentUTCTime)
        }
      });

      return NextResponse.json({
        success: false,
        data: {
          message: "Payment failed",
          error: error_description,
          orderId: order.id,
          timestamp: currentUTCTime
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: "Unhandled event type",
      event_type: event.event,
      timestamp: currentUTCTime
    }, { status: 400 });

  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json({
      success: false,
      error: "Webhook failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}