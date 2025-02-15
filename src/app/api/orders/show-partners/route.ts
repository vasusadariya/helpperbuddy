// api/orders/show-partners/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

interface PartnerResponse {
  id: string;
  name: string;
  email: string;
  phoneno: string | null;
//   profileImage: string | null;
  isActive: boolean;
  lastActiveAt: string | null;
  serviceAreas: Array<{
    pincode: string;
  }>;
  services: Array<{
    name: string;
    category: string;
  }>;
}

export async function GET(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  let session;

  try {
    // Validate session
    session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Parse query parameters for filtering
    const url = new URL(req.url);
    const serviceId = url.searchParams.get("serviceId");
    const pincode = url.searchParams.get("pincode");

    if (!serviceId || !pincode) {
      return NextResponse.json({
        success: false,
        error: "Service ID and pincode are required",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Fetch eligible partners
    const partners = await prisma.partner.findMany({
      where: {
        approved: true,
        isActive: true,
        AND: [
          {
            serviceProvider: {
              some: {
                serviceId: serviceId,
                isActive: true,
              },
            },
          },
          {
            partnerPincode: {
              some: {
                pincode: pincode,
                isActive: true,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true,
        // profileImage: true,
        isActive: true,
        lastActiveAt: true,
        partnerPincode: {
          where: { isActive: true },
          select: {
            pincode: true
          }
        },
        serviceProvider: {
          where: { isActive: true },
          select: {
            Service: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (partners.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No service providers available",
        details: `No service providers available for pincode ${pincode}`,
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Format partner data
    const formattedPartners: PartnerResponse[] = partners.map(partner => ({
      id: partner.id,
      name: partner.name,
      email: partner.email,
      phoneno: partner.phoneno,
    //   profileImage: partner.profileImage,
      isActive: partner.isActive,
      lastActiveAt: partner.lastActiveAt?.toISOString() ?? null,
      serviceAreas: partner.partnerPincode.map(pp => ({
        pincode: pp.pincode
      })),
      services: partner.serviceProvider.map(sp => ({
        name: sp.Service.name,
        category: sp.Service.category
      }))
    }));

    return NextResponse.json({
      success: true,
      data: {
        partners: formattedPartners,
        meta: {
          total: formattedPartners.length,
          serviceId,
          pincode,
          timestamp: currentUTCTime
        }
      }
    });

  } catch (error) {
    console.error("[Show Partners API Error]:", {
      timestamp: currentUTCTime,
      user: session?.user?.email,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      error: "Failed to fetch partners",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}