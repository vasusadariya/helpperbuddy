import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    // Log the raw request body
    const text = await request.text();
    console.log("Raw Request Body:", text);

    // Ensure the body is not empty
    if (!text) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const body = JSON.parse(text);
    console.log("Parsed Request Body:", body);

    const { partnerId, approved } = body;

    if (!partnerId || approved === undefined) {
      return NextResponse.json({ error: "Partner ID and approval status are required" }, { status: 400 });
    }

    // Update partner approval in DB
    await prisma.partner.update({
      where: { id: partnerId },
      data: { approved },
    });

    return NextResponse.json({ message: `Partner ${approved ? "approved" : "rejected"} successfully` }, { status: 200 });
  } catch (error) {
    console.error("Error updating partner approval:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
