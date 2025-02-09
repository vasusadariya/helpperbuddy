import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({ message: "User promoted to admin", updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
