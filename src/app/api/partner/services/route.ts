import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the partner's ID
    const partner = await prisma.partner.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Get all services provided by this partner
    const partnerServices = await prisma.serviceProvider.findMany({
      where: {
        partnerId: partner.id
      },
      include: {
        service: true
      }
    });

    return NextResponse.json(partnerServices);

  } catch (error) {
    console.error("Error fetching partner services:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner services" },
      { status: 500 }
    );
  }
}