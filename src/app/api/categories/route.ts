import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Fetching categories..."); // Debug log

    // Fetch enum values
    const categories = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"Category")) AS category;
    `;
    const categoryList = categories.map((c: { category: string }) => c.category);

    return NextResponse.json(categoryList, { status: 200 });
  } catch (error) {
    console.error("API Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
