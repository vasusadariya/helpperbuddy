import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Group transactions by date and calculate total revenue per day
    const dailySales = await prisma.transaction.groupBy({
      by: ["createdAt"],
      _sum: { amount: true },
      where: { type: "CREDIT" }, // Only credit transactions
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      dailySales.map((entry) => ({
        date: entry.createdAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
        totalRevenue: entry._sum.amount || 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}