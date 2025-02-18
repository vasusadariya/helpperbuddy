import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET() {
  const currentUTCTime = new Date("2025-02-17 17:56:28");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Valid session required",
          timestamp: currentUTCTime,
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          timestamp: currentUTCTime,
        },
        { status: 404 }
      );
    }

    // Get all wallet transactions
    const walletTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      include: {
        Order: {
          select: {
            id: true,
            status: true,
            Service: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all orders with Razorpay payments
    const ordersWithPayments = await prisma.order.findMany({
      where: {
        userId: user.id,
        razorpayPaymentId: {
          not: null
        },
        paidAt: {
          not: null
        }
      },
      select: {
        id: true,
        razorpayPaymentId: true,
        remainingAmount: true,
        paidAt: true,
        status: true,
        Service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        paidAt: 'desc'
      }
    });

    // Transform orders into transaction format
    const paymentTransactions = ordersWithPayments.map(order => ({
      id: order.razorpayPaymentId!,
      amount: order.remainingAmount,
      type: "DEBIT" as const,
      description: `Razorpay payment for order #${order.id}`,
      createdAt: order.paidAt!,
      orderId: order.id,
      Order: {
        id: order.id,
        status: order.status,
        service: {
          name: order.Service.name
        }
      }
    }));

    // Combine and sort all transactions
    const allTransactions = [...walletTransactions, ...paymentTransactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        transactions: allTransactions,
        timestamp: currentUTCTime,
      }
    });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: currentUTCTime,
      },
      { status: 500 }
    );
  }
}