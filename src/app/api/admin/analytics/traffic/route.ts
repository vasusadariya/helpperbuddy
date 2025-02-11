import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Count orders per day
    const trafficData = await prisma.order.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      trafficData.map((entry) => ({
        date: entry.createdAt.toISOString().split("T")[0],
        visits: entry._count.id, // Using order count as traffic indicator
      }))
    );
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}