import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    // Get partner with all related data
    const partner = await prisma.partner.findFirst({
      where: { 
        email: session.user.email,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneno: true,
        approved: true,
        isActive: true,
        lastActiveAt: true,
        serviceProvider: {
          where: { 
            isActive: true 
          },
          select: {
            Service: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
                description: true,
                isActive: true
              }
            }
          }
        },
        partnerPincode: {
          where: { 
            isActive: true 
          },
          select: {
            id: true,
            pincode: true,
            createdAt: true
          }
        },
        partnerRequestedService: {
          where: {
            status: 'PENDING'
          },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true
          }
        },
        Order: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            status: true,
            date: true,
            time: true,
            amount: true,
            service: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: "Partner not found or not active",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Format the response with safe access
    const response = {
      profile: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phoneno || null,
        approved: partner.approved,
        isActive: partner.isActive,
        lastActive: partner.lastActiveAt
      },
      services: partner.serviceProvider
        .filter(sp => sp.Service !== null)
        .map(sp => ({
          id: sp.Service.id,
          name: sp.Service.name,
          price: sp.Service.price,
          category: sp.Service.category,
          description: sp.Service.description,
          isActive: sp.Service.isActive
        })),
      serviceAreas: partner.partnerPincode.map(pp => ({
        id: pp.id,
        pincode: pp.pincode,
        addedAt: pp.createdAt
      })),
      pendingServiceRequests: partner.partnerRequestedService.map(prs => ({
        id: prs.id,
        name: prs.name,
        description: prs.description || null,
        status: prs.status,
        requestedAt: prs.createdAt
      })),
      recentOrders: partner.Order
        .filter(order => order.service !== null)
        .map(order => ({
          id: order.id,
          serviceName: order.service.name,
          category: order.service.category,
          status: order.status,
          date: order.date.toISOString().split('T')[0],
          time: order.time,
          amount: order.amount
        })),
      meta: {
        totalServices: partner.serviceProvider.length,
        totalServiceAreas: partner.partnerPincode.length,
        pendingRequests: partner.partnerRequestedService.length,
        timestamp: currentUTCTime
      }
    };

    // Update last active timestamp
    await prisma.partner.update({
      where: { id: partner.id },
      data: { lastActiveAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("[Partner Profile Error]:", {
      timestamp: currentUTCTime,
      user: session?.user?.email,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      error: "Failed to fetch partner profile",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Get the partner
    const partner = await prisma.partner.findUnique({
      where: { email: session.user.email }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: "Partner not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    const { serviceName, description } = await request.json();

    if (!serviceName?.trim()) {
      return NextResponse.json({
        success: false,
        error: "Service name is required",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Check if a similar request is already pending
    const existingRequest = await prisma.partnerRequestedService.findFirst({
      where: {
        name: serviceName.trim(),
        partnerId: partner.id,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: "A similar service request is already pending",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Create the service request with description
    const serviceRequest = await prisma.partnerRequestedService.create({
      data: {
        name: serviceName.trim(),
        description: description?.trim() || null, // Handle description
        partnerId: partner.id,
        status: 'PENDING'
      }
    });

    console.log('Created service request:', serviceRequest); // Debug log

    return NextResponse.json({
      success: true,
      data: {
        request: serviceRequest,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to create service request",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    let { name, email, password, pincodes, phoneno } = body;

    // Check required fields
    if (!name || !email || !password || !pincodes || !phoneno) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phoneno)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Process pincodes into array
    const pincodesArray = Array.isArray(pincodes) ? pincodes.map(p => p.trim()) : [pincodes.trim()];
    console.log('Processed pincodes:', pincodesArray);

    // Check if partner already exists
    const existingPartner = await prisma.partner.findUnique({
      where: { email },
    });

    if (existingPartner) {
      return NextResponse.json({ error: 'Partner with this email already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create partner
      const partner = await tx.partner.create({
        data: { 
          name, 
          email, 
          password: hashedPassword, 
          service: [], // Initialize with empty service array
          phoneno,
          approved: false
        }
      });

      console.log('Partner created:', partner.id);

      // Insert pincodes
      if (pincodesArray.length > 0) {
        await tx.partnerPincode.createMany({
          data: pincodesArray.map(pincode => ({
            partnerId: partner.id,
            pincode: pincode
          }))
        });
      }

      return partner;
    });

    return NextResponse.json(
      { 
        id: result.id, 
        name: result.name, 
        email: result.email, 
        approved: result.approved,
        phoneno: result.phoneno
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating partner:', error.message, error.stack);
    return NextResponse.json({ 
      error: 'Error creating partner', 
      details: JSON.stringify(error, null, 2) 
    }, { status: 500 });
  }
}