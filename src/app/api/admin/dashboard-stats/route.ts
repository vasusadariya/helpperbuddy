import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total revenue (handle null case)
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });

    // Get monthly sales data (handle null case)
    const monthlySales = (await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YY') as month,
        COUNT(*) as orders,
        COALESCE(SUM(amount), 0) as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    ` as Prisma.JsonArray) ?? [];

    // Get user growth data (handle null case)
    const userGrowth = (await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YY') as month,
        COUNT(*) as users
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `) ?? [];

    // Get sales by category (handle null case)
    const salesByCategory = (await prisma.$queryRaw`
      SELECT 
        s.category as category,
        COUNT(o.id) as sales,
        COALESCE(SUM(o.amount), 0) as revenue
      FROM "Order" o
      JOIN "Service" s ON o.serviceId = s.id
      WHERE o.status = 'COMPLETED'
      AND o."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY s.category
      ORDER BY sales DESC
    ` as Prisma.JsonArray) ?? [];

    // Helper function to safely convert BigInt to Number
    const parseBigInt = (value: any) => (typeof value === 'bigint' ? Number(value) : value);

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue: parseBigInt(totalRevenue._sum.amount ?? 0),
      monthlySales: monthlySales.map((row: any) => ({
        ...row,
        revenue: parseBigInt(row.revenue),
      })),
      userGrowth,
      salesByCategory: salesByCategory.map((row: any) => ({
        ...row,
        revenue: parseBigInt(row.revenue),
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
