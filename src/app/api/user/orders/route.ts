// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient, Status } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";

const prisma = new PrismaClient();

interface PaginationParams {
  page: number;
  limit: number;
  status?: Status;
}

interface OrderResponse {
  id: string;
  service: {
    name: string;
    price: number;
    category: string;
  };
  Partner?: {
    id: string;
    name: string;
    email: string;
    phoneno: string | null;
    isActive: boolean;
    lastActiveAt: string | null;
  } | null;
  status: Status;
  date: string;
  time: string;
  address: string;
  pincode: string;
  amount: number;
  remainingAmount: number;
  walletAmount: number;
  remarks: string | null;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  review: {
    id: string;
    rating: number;
    description: string | null;
    createdAt: string;
  } | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function GET(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let session
  try {
    // Get session
    session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const params: PaginationParams = {
      page: Math.max(1, parseInt(searchParams.get("page") || "1")),
      limit: Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10"))),
    };

    const status = searchParams.get("status");
    if (status && Object.values(Status).includes(status as Status)) {
      params.status = status as Status;
    }

    const skip = (params.page - 1) * params.limit;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Build where clause
    const whereClause: Prisma.OrderWhereInput = {
      userId: user.id,
      ...(params.status && { status: params.status })
    };

    // Fetch orders with related data
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        include: {
          Service: {
            select: {
              name: true,
              price: true,
              category: true
            }
          },
          Partner: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneno: true,
              isActive: true,
              lastActiveAt: true
            }
          },
          Review: {
            select: {
              id: true,
              rating: true,
              description: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit
      }),
      prisma.order.count({ where: whereClause })
    ]);

    // Format orders
    const formattedOrders: OrderResponse[] = orders.map(order => ({
      // assignedAt: order.assignedAt?.toISOString() ?? null,
      id: order.id,
      service: {
        name: order.Service?.name ?? 'Service Unavailable',
        price: order.Service?.price ?? 0,
        category: order.Service?.category ?? 'Uncategorized'
      },
      Partner: order.Partner ? {
        id: order.Partner.id,
        name: order.Partner.name,
        email: order.Partner.email,
        phoneno: order.Partner.phoneno,
        isActive: order.Partner.isActive,
        lastActiveAt: order.Partner.lastActiveAt?.toISOString() ?? null
      } : null,
      status: order.status,
      date: order.date.toISOString().split('T')[0],
      time: order.time,
      address: order.address,
      pincode: order.pincode,
      amount: order.amount,
      remainingAmount: order.remainingAmount ?? 0,
      walletAmount: order.walletAmount ?? 0,
      remarks: order.remarks,
      razorpayPaymentId: order.razorpayPaymentId,
      paidAt: order.paidAt?.toISOString() ?? null,
      review: order.Review ? {
        id: order.Review.id,
        rating: order.Review.rating,
        description: order.Review.description,
        createdAt: order.Review.createdAt.toISOString()
      } : null,
      acceptedAt: order.acceptedAt?.toISOString() ?? null,
      startedAt: order.startedAt?.toISOString() ?? null,
      completedAt: order.completedAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          total,
          pages: Math.ceil(total / params.limit),
          currentPage: params.page,
          limit: params.limit,
          hasNextPage: skip + params.limit < total,
          hasPreviousPage: params.page > 1
        },
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("[Orders API Error]:", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error',
      timestamp: currentUTCTime,
      user: session?.user?.email
    });

    return NextResponse.json({
      success: false,
      error: "Failed to fetch orders",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
