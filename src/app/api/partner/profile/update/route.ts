import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PUT(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Check if request has a body
      const contentType = request.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return NextResponse.json(
          { success: false, error: "Content-Type must be application/json" },
          { status: 400 }
        );
      }

      let body;
      try {
        body = await request.json();
      } catch (e) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }

      // Extract only phone number from body, ignore email
      const { phoneno } = body;

      // Validate phone number if provided
      if (!phoneno) {
        return NextResponse.json(
          { success: false, error: "Phone number must be provided" },
          { status: 400 }
        );
      }

      if (!/^\d{10}$/.test(phoneno)) {
        return NextResponse.json(
          { success: false, error: "Invalid phone number" },
          { status: 400 }
        );
      }

      // Create update data object with only phone number
      const updateData = { phoneno };

      // Use a transaction to update both Partner and User tables
      const [updatedPartner, updatedUser] = await prisma.$transaction(async (tx) => {
        // Update Partner
        const partner = await tx.partner.update({
          where: { email: session.user!.email as string },
          data: updateData,
        });

        // Update corresponding User
        const user = await tx.user.update({
          where: { email: session.user!.email as string },
          data: updateData,
        });

        return [partner, user];
      });
  
      return NextResponse.json({
        success: true,
        data: {
          partner: updatedPartner,
          user: updatedUser,
        },
      });
    } catch (error) {
      // Fixed error logging to use string interpolation
      console.error(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Handle unique constraint violations
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002' &&
        'meta' in error
      ) {
        return NextResponse.json(
          { 
            success: false, 
            error: `The ${(error as any).meta?.target?.[0]} is already taken` 
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
}