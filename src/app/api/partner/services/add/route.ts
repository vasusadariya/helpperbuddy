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
  
      const { serviceId } = await request.json();
  
      const partner = await prisma.partner.findUnique({
        where: { email: session.user.email },
      });
  
      if (!partner) {
        return NextResponse.json(
          { success: false, error: "Partner not found" },
          { status: 404 }
        );
      }
  
      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
  
      if (!service) {
        return NextResponse.json(
          { success: false, error: "Service not found" },
          { status: 404 }
        );
      }
  
      // Check if partner already provides this service
      const existingService = await prisma.serviceProvider.findUnique({
        where: {
          serviceId_partnerId: {
            serviceId,
            partnerId: partner.id,
          },
        },
      });
  
      if (existingService) {
        return NextResponse.json(
          { success: false, error: "Service already added" },
          { status: 400 }
        );
      }
  
      // Add service provider record
      await prisma.serviceProvider.create({
        data: {
          serviceId,
          partnerId: partner.id,
        },
      });
  
      // Update partner's service array
      await prisma.partner.update({
        where: { id: partner.id },
        data: {
          service: {
            push: service.name,
          },
        },
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error adding service:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  }