import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendApprovalEmail } from "../../services/emailService";

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

    // Update partner approval in DB and get the updated partner data
    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: { approved },
      select: {
        name: true,
        email: true,
        service: true
      }
    });

    // Send email only if partner is approved
    if (approved) {
      try {
        await sendApprovalEmail({
          name: partner.name,
          email: partner.email,
          services: partner.service as string[]
        });
        console.log("Approval email sent successfully");
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
        // Continue execution even if email fails
      }
    }

    return NextResponse.json({ 
      message: `Partner ${approved ? "approved" : "rejected"} successfully`,
      emailSent: approved 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating partner approval:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}