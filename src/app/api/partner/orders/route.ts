import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
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

    const partner = await prisma.partner.findUnique({
      where: { email: session.user.email }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: "Partner not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Get accepted orders for this partner
    const acceptedOrders = await prisma.order.findMany({
      where: {
        partnerId: partner.id,
        status: {
          in: ['ACCEPTED', 'COMPLETED']
        }
      },
      include: {
        service: {
          select: {
            name: true,
            price: true,
            category: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        {
          status: 'asc'  // ACCEPTED orders first
        },
        {
          updatedAt: 'desc'  // Most recent first
        }
      ]
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: acceptedOrders.map(order => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          date: order.date.toISOString(),
          paidAt: order.paidAt?.toISOString() || null
        })),
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    const session = await getServerSession(authOptions);
    console.error("[Partner Orders Error]:", {
      error,
      timestamp: currentUTCTime,
      user: session?.user?.email
    });

    return NextResponse.json({
      success: false,
      error: "Failed to fetch orders",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}