import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendApprovalEmail } from "../../services/emailService";

export async function PUT(request: NextRequest) {
  try {
    const { partnerId, approved } = await request.json();

    if (!partnerId || approved === undefined) {
      return NextResponse.json({ error: "Partner ID and approval status are required" }, { status: 400 });
    }

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: { approved },
    });

    if (approved) {
      await sendApprovalEmail({
        name: partner.name,
        email: partner.email,
        services: partner.services as string[]
      });
    }

    return NextResponse.json({ message: `Partner ${approved ? "approved" : "rejected"} successfully` }, { status: 200 });
  } catch (error) {
    console.error("Error updating partner approval:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}