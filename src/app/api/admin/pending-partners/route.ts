import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      where: { approved: false },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ partners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending partners:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}