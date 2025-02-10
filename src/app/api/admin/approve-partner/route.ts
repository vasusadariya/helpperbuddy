// route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendApprovalEmail } from "../../services/emailServices/route";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, approved } = body;

    if (!partnerId || approved === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (approved) {
      const result = await prisma.$transaction(async (tx) => {
        const partner = await tx.partner.findUnique({
          where: { id: partnerId },
          select: { name: true, email: true, password: true, service: true }
        });

        if (!partner) throw new Error("Partner not found");

        const existingUser = await tx.user.findUnique({
          where: { email: partner.email }
        });

        if (existingUser) throw new Error("User already exists with this email");

        const user = await tx.user.create({
          data: {
            name: partner.name,
            email: partner.email,
            password: partner.password,
            role: 'PARTNER',
            referralCode: `REF${Math.random().toString(36).slice(2, 8).toUpperCase()}`
          }
        });

        const updatedPartner = await tx.partner.update({
          where: { id: partnerId },
          data: { approved: true }
        });

        return { partner: updatedPartner, user };
      });

      try {
        await sendApprovalEmail({
          name: result.partner.name,
          email: result.partner.email,
          services: result.partner.service as string[]
        });
        console.log("Approval email sent successfully");
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
        // Continue execution even if email fails
      }

      return NextResponse.json({ success: true, data: result });

    } else {
      await prisma.$transaction([
        prisma.partnerPincode.deleteMany({ where: { partnerId } }),
        prisma.serviceProvider.deleteMany({ where: { partnerId } }),
        prisma.partner.delete({ where: { id: partnerId } })
      ]);

      return NextResponse.json({ success: true });
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { 
      status: message.includes("already exists") ? 400 : 500 
    });
  }
}