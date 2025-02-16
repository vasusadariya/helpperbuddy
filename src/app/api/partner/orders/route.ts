import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
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
      where: { 
        email: session.user.email,
        approved: true, // Added approved check
        isActive: true  // Added active check
      }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: "Partner not found or not approved",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

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
            email: true,
            phoneno: true // Added phone number
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ]
    });

    // Update partner's last active timestamp
    await prisma.partner.update({
      where: { id: partner.id },
      data: { lastActiveAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: acceptedOrders.map(order => ({
          id: order.id,
          service: order.service,
          user: order.user,
          date: order.date.toISOString(),
          time: order.time,
          status: order.status,
          amount: order.amount,
          address: order.address, // Added address
          pincode: order.pincode, // Added pincode
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: order.razorpayPaymentId,
          paidAt: order.paidAt?.toISOString() || null,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString()
        })),
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    const session = await getServerSession(authOptions);
    console.error("[Partner Orders Error]:", {
      error,
      timestamp: currentUTCTime,
      user: session?.user?.email,
      errorDetails: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      error: "Failed to fetch orders",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}