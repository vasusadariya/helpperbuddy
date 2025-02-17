import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    const  session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { email: session.user.email },
      include: {
        PartnerPincode: {
          where: { isActive: true },
          select: {
            id: true,
            pincode: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...partner,
        pincodes: partner.PartnerPincode,
      },
    });
  } catch (error) {
    console.error("Error fetching partner profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}