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

    const result = await prisma.$transaction(async (tx) => {
      // Get partner details
      const partner = await tx.partner.findUnique({
        where: { email: session.user.email }
      });

      if (!partner) {
        throw new Error("Partner not found");
      }

      // Check if order is still available
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          status: 'PENDING',
          partnerId: null
        }
      });

      if (!order) {
        throw new Error("Order is no longer available");
      }

      // Update order status and assign partner
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'ACCEPTED',
          partnerId: partner.id
        }
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: {
        order: result,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("Error accepting order:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to accept order",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}