import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";


export async function POST(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      const { pincode } = await request.json();
  
      // Validate pincode
      if (!/^\d{6}$/.test(pincode)) {
        return NextResponse.json(
          { success: false, error: "Invalid pincode format" },
          { status: 400 }
        );
      }
  
      const partner = await prisma.partner.findUnique({
        where: { email: session.user.email },
      });
  
      if (!partner) {
        return NextResponse.json(
          { success: false, error: "Partner not found" },
          { status: 404 }
        );
      }
  
      // Check if pincode already exists for this partner
      const existingPincode = await prisma.partnerPincode.findUnique({
        where: {
          partnerId_pincode: {
            partnerId: partner.id,
            pincode,
          },
        },
      });
  
      if (existingPincode) {
        if (!existingPincode.isActive) {
          // Reactivate the pincode if it was previously deactivated
          await prisma.partnerPincode.update({
            where: { id: existingPincode.id },
            data: { isActive: true },
          });
          return NextResponse.json({ success: true });
        }
        return NextResponse.json(
          { success: false, error: "Pincode already added" },
          { status: 400 }
        );
      }
  
      // Add new pincode
      await prisma.partnerPincode.create({
        data: {
          partnerId: partner.id,
          pincode,
        },
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error adding pincode:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  }