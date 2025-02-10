import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        service: {
          select: {
            name: true,
            price: true,
            category: true,
          }
        },
        Partner: {
          select: {
            name: true,
            email: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true,
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

    // Check if user has permission to view this order
    if (order.user.email !== session.user.email && order.Partner?.email !== session.user.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized to view this order",
        timestamp: currentUTCTime
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        remainingAmount: order.remainingAmount,
        walletAmount: order.walletAmount,
        service: {
          name: order.service.name,
          price: order.service.price
        },
        partner: order.Partner ? {
          name: order.Partner.name
        } : null,
        date: order.date.toISOString(),
        time: order.time,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("[Order Status Error]:", {
      orderId: params.orderId,
      error,
      timestamp: currentUTCTime
    });
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch order status",
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}