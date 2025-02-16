import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'USER',
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phoneno: true,
          createdAt: true,
          wallet: {
            select: {
              balance: true,
            },
          },
          Order: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              status: true,
              amount: true,
              createdAt: true,
            },
          },
          Transaction: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
            select: {
              id: true,
              amount: true,
              type: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: {
          role: 'USER',
        },
      }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}