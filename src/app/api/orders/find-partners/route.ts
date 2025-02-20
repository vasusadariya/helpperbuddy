import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, pincode } = body;

    if (!serviceId || !pincode) {
      return NextResponse.json({
        success: false,
        error: "Service ID and pincode are required"
      }, { status: 400 });
    }

    // Find eligible partners who:
    // 1. Are approved
    // 2. Provide the requested service
    // 3. Serve the requested pincode
    const eligiblePartners = await prisma.partner.findMany({
      where: {
        approved: true,
        AND: [
          {
            ServiceProvider: {
              some: {
                serviceId: serviceId
              }
            }
          },
          {
            PartnerPincode: {
              some: {
                pincode: pincode
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        phoneno: true,
        ServiceProvider: {
          where: {
            serviceId: serviceId
          },
          include: {
            Service: true
          }
        },
        PartnerPincode: {
          where: {
            pincode: pincode
          }
        }
      }
    });

    if (eligiblePartners.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No service providers available in your area"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        partners: eligiblePartners.map(partner => ({
          id: partner.id,
          name: partner.name,
          phoneno: partner.phoneno,
          service: partner.ServiceProvider[0]?.Service
        }))
      }
    });

  } catch (error) {
    console.error("Error finding partners:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to find service providers"
    }, { status: 500 });
  }
}