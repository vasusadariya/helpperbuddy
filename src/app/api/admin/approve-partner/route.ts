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

    if (approved) {
      // If approving, just update the approval status
      const partner = await prisma.partner.update({
        where: { id: partnerId },
        data: { approved },
        select: {
          name: true,
          email: true,
          service: true
        }
      });

      // Send approval email
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

      return NextResponse.json({ 
        message: "Partner approved successfully",
        emailSent: true 
      }, { status: 200 });

    } else {
      // If rejecting, delete all related records in a transaction
      await prisma.$transaction(async (tx) => {
        // First delete all partner pincodes
        await tx.partnerPincode.deleteMany({
          where: { partnerId }
        });

        // Delete all service provider entries
        await tx.serviceProvider.deleteMany({
          where: { partnerId }
        });

        // Finally delete the partner
        await tx.partner.delete({
          where: { id: partnerId }
        });
      });

      return NextResponse.json({ 
        message: "Partner rejected and all related records deleted successfully",
        emailSent: false 
      }, { status: 200 });
    }

  } catch (error) {
    console.error("Error updating partner approval:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}