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
    if (!session.user.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

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
        Service: true
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get the partner
    const partner = await prisma.partner.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const { services } = await request.json();

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one service" },
        { status: 400 }
      );
    }

    // Start a transaction to handle all database operations
    await prisma.$transaction(async (tx) => {
      // First, get all service IDs for the selected service names
      const serviceRecords = await tx.service.findMany({
        where: {
          name: {
            in: services
          }
        },
        select: {
          id: true
        }
      });

      if (serviceRecords.length === 0) {
        throw new Error("No valid services found");
      }

      // Delete existing service provider entries for this partner
      await tx.serviceProvider.deleteMany({
        where: {
          partnerId: partner.id
        }
      });

      // Create new service provider entries
      await tx.serviceProvider.createMany({
        data: serviceRecords.map(service => ({
          partnerId: partner.id,
          serviceId: service.id
        }))
      });

      // Update partner's service array
      await tx.partner.update({
        where: {
          id: partner.id
        },
        data: {
          service: services
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Services updated successfully"
    });

  } catch (error) {
    console.error("Error updating partner services:", error);
    return NextResponse.json(
      { 
        error: "Failed to update services",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}