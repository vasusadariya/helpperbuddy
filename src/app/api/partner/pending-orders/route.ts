// app/api/partner/pending-orders/route.ts
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

    // Get services provided by this partner
    const serviceProviders = await prisma.serviceProvider.findMany({
      where: { partnerId: partner.id },
      select: { serviceId: true }
    });

    const serviceIds = serviceProviders.map(sp => sp.serviceId);

    // Get pending orders for these services
    const pendingOrders = await prisma.order.findMany({
      where: {
        serviceId: { in: serviceIds },
        status: 'PENDING'
      },
      include: {
        service: {
          select: {
            name: true,
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: pendingOrders,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("Error fetching pending orders:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch pending orders",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}