import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { calculateOrderAge, formatDateTime } from "@/lib/utils/timeUtils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: { email: session.user.email }
      },
      include: {
        service: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const orderAge = calculateOrderAge(order.createdAt);
    const thresholdHours = Number(order.service.threshold) || 2;

    if (order.status !== "PENDING" || order.partnerId) {
      return NextResponse.json(
        { success: false, error: "Order cannot be cancelled" },
        { status: 400 }
      );
    }

    if (orderAge < thresholdHours) {
      return NextResponse.json(
        {
          success: false,
          error: "Order is still within threshold period",
          timeRemaining: thresholdHours - orderAge
        },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        order: cancelledOrder,
        timestamp: formatDateTime(new Date())
      }
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}