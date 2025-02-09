// app/api/admin/approve-partner/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendApprovalEmail } from "../../services/emailService";
import { hash } from 'bcryptjs';

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
      // If approving, update in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Get partner details first
        const partner = await tx.partner.findUnique({
          where: { id: partnerId },
          select: {
            name: true,
            email: true,
            password: true,
            service: true
          }
        });

        if (!partner) {
          throw new Error("Partner not found");
        }

        // Check if user already exists with this email
        const existingUser = await tx.user.findUnique({
          where: { email: partner.email }
        });

        if (existingUser) {
          throw new Error("User already exists with this email");
        }

        // Create user record
        const user = await tx.user.create({
          data: {
            name: partner.name,
            email: partner.email,
            password: partner.password, // Already hashed from partner registration
            role: 'PARTNER'
          }
        });

        // Update partner approval status
        const updatedPartner = await tx.partner.update({
          where: { id: partnerId },
          data: { approved: true }
        });

        return { partner: updatedPartner, user };
      });

      // Send approval email
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

      return NextResponse.json({ 
        message: "Partner approved and user account created successfully",
        emailSent: true,
        userId: result.user.id,
        partnerId: result.partner.id
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
    let errorMessage = "Internal Server Error";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message === "User already exists with this email") {
        errorMessage = error.message;
        statusCode = 400;
      }
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: statusCode });
  }
}