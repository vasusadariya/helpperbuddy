// app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Category } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category");

    let services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
        ...(category && category !== "all" ? { category: category as Category } : {}),
      },
      orderBy: { numberoforders: "desc" },
    });

    // Convert Decimal fields to numbers
    return NextResponse.json(
      services.map(service => ({
        ...service,
        threshold: service.threshold?.toNumber(),
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
