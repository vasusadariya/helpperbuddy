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
        service: {
          select: {
            name: true,
            threshold: true
          }
        }
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
    const timeRemaining = Math.max(0, thresholdHours - orderAge);

    const isCancellable = 
      order.status === "PENDING" && 
      !order.partnerId && 
      orderAge >= thresholdHours;

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        serviceName: order.service.name,
        isCancellable,
        timeRemaining: Math.round(timeRemaining * 100) / 100,
        thresholdHours,
        currentTime: formatDateTime(new Date())
      }
    });

  } catch (error) {
    console.error("Error checking cancellation status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check order status" },
      { status: 500 }
    );
  }
}