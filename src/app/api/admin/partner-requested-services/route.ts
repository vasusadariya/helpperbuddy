import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, ServiceRequestStatus } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Verify if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: "Unauthorized. Admin access required.",
        timestamp: currentUTCTime
      }, { status: 403 });
    }

    // Modified query to ensure we get the description
    const requests = await prisma.partnerRequestedService.findMany({
      include: {
        Partner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Log the first request to verify data
    console.log('First request data:', requests[0]);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch service requests",
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Verify if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: "Unauthorized. Admin access required.",
        timestamp: currentUTCTime
      }, { status: 403 });
    }

    const { requestId, status } = await request.json();

    if (!requestId || !status || !Object.values(ServiceRequestStatus).includes(status)) {
      return NextResponse.json({
        success: false,
        error: "Invalid request data",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Update with proper description handling
    const updatedRequest = await prisma.partnerRequestedService.update({
      where: { id: requestId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        Partner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Log the updated request to verify data
    console.log('Updated request:', updatedRequest);

    return NextResponse.json({
      success: true,
      data: {
        request: updatedRequest,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error('Error updating service request:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to update service request",
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}