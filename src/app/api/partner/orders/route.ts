// app/api/partner/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { partnerId: session.user.id },
          {
            AND: [
              { status: 'PENDING' },
              {
                service: {
                  providers: {
                    some: {
                      partnerId: session.user.id
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
    
  } catch (error) {
    console.error("Error fetching partner orders:", error);
    return NextResponse.json({ 
      error: "Failed to fetch orders"
    }, { status: 500 });
  }
}