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

export async function GET(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Get session
    const session = await getServerSession(authOptions);
    
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
    if (status) {
      // Validate status is a valid enum value
      if (Object.values(Status).includes(status as Status)) {
        params.status = status as Status;
      }
    }

    const skip = (params.page - 1) * params.limit;

    // Get user
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true
      }
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
          service: {
            select: {
              name: true,
              price: true,
              category: true
            }
          },
          Partner: {
            select: {
              name: true,
              email: true,
              phoneno: true
            }
          },
          review: {
            select: {
              id: true,
              rating: true,
              description: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: params.limit
      }),
      prisma.order.count({
        where: whereClause
      })
    ]);

    // Format orders to ensure no null values
    const formattedOrders = orders.map(order => ({
      id: order.id,
      service: {
        name: order.service?.name ?? 'Service Unavailable',
        price: order.service?.price ?? 0,
        category: order.service?.category ?? 'Uncategorized'
      },
      partner: order.Partner ? {
        name: order.Partner.name,
        email: order.Partner.email,
        phone: order.Partner.phoneno ?? 'Not provided'
      } : null,
      status: order.status,
      date: order.date.toISOString().split('T')[0],
      time: order.time,
      address: order.address,
      pincode: order.pincode,
      amount: order.amount,
      remarks: order.remarks ?? null,
      review: order.review ? {
        id: order.review.id,
        rating: order.review.rating,
        description: order.review.description ?? null,
        createdAt: order.review.createdAt.toISOString()
      } : null,
      timestamps: {
        created: order.createdAt.toISOString(),
        updated: order.updatedAt.toISOString(),
        accepted: order.acceptedAt?.toISOString() ?? null,
        completed: order.completedAt?.toISOString() ?? null
      }
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
      timestamp: currentUTCTime
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