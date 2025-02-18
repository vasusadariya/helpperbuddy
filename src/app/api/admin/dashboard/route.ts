// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'day';

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    if (timeframe === 'day') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 28);
    } else {
      startDate.setMonth(now.getMonth() - 12);
    }

    // Get total users count
    const totalUsers = await prisma.user.count({
      where: {
        role: 'USER',
      },
    });

    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });

    const avgOrderValue = await prisma.order.aggregate({
      _avg: {
        amount: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });

    const popularServices = await prisma.service.findMany({
      select: {
        name: true,
        numberoforders: true,
      },
      orderBy: {
        numberoforders: 'desc',
      },
      take: 5,
    });

    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        Service: {
          select: {
            category: true,
          },
        },
      },
    });

    const categoryRevenue: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.Service?.category && order.amount) {
        const category = order.Service.category;
        categoryRevenue[category] = (categoryRevenue[category] || 0) + order.amount;
      }
    });

    const revenueByCategory = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue,
    }));

    const transactionTrends = await prisma.transaction.groupBy({
      by: ['type'],
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const responseData = {
      totalUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageOrderValue: avgOrderValue._avg.amount || 0,
      popularServices: popularServices.map(s => ({
        name: s.name,
        orders: s.numberoforders || 0,
      })),
      revenueByCategory,
      transactionTrends: transactionTrends.map(t => ({
        type: t.type,
        amount: t._sum.amount || 0,
      })),
    };

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}