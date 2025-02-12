import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/options";

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