import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      where: { 
        approved: true // Only get partners who are approved
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true,
        service: true,
        approved: true,
        isActive: true,
        PartnerPincode: {
          select: {
            pincode: true,
            isActive: true
          }
        },
        ServiceProvider: {
          select: {
            id: true,
            isActive: true,
            Service: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        Order: {
          where: {
            status: {
              in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'SERVICE_COMPLETED', 'PAYMENT_REQUESTED']
            }
          },
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Get only last 5 active orders
        },
        createdAt: true,
        lastActiveAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include only active pincodes and format the response
    const formattedPartners = partners.map(partner => ({
      id: partner.id,
      name: partner.name,
      email: partner.email,
      phoneno: partner.phoneno,
      createdAt: partner.createdAt,
      lastActiveAt: partner.lastActiveAt,
      isActive: partner.isActive,
      approved: partner.approved,
      // Get all services (both from service array and ServiceProvider)
      services: [
        ...partner.service,
        ...partner.ServiceProvider
          .filter(sp => sp.isActive)
          .map(sp => sp.Service.name)
      ].filter((value, index, self) => self.indexOf(value) === index), // Remove duplicates
      // Get only active pincodes
      pincodes: partner.PartnerPincode
        .filter(pp => pp.isActive)
        .map(pp => pp.pincode),
      // Current active orders count
      activeOrdersCount: partner.Order.length,
      // Latest orders
      recentOrders: partner.Order.map(order => ({
        id: order.id,
        status: order.status,
        createdAt: order.createdAt
      }))
    }));

    return NextResponse.json({ 
      partners: formattedPartners,
      totalCount: formattedPartners.length
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching approved partners:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}