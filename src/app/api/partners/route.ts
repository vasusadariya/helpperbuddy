import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

// Partner Registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, pincodes } = body;

    if (!name || !email || !password || !pincodes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const partner = await prisma.partner.create({
      data: {
        name,
        email,
        password: hashedPassword,
        pincodes: Array.isArray(pincodes) ? pincodes : [pincodes],
        approved: false, // Requires admin approval
      }
    });

    return NextResponse.json({ id: partner.id, name: partner.name, email: partner.email, approved: partner.approved }, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ error: 'Error creating partner', details: error.message }, { status: 500 });
  }
}

// Get All Services
export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany();
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
  }
}

// Request New Service (Partner Requests for Admin Approval)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, serviceName } = body;

    if (!partnerId || !serviceName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        partnerId,
        name: serviceName,
        approved: false, // Needs admin approval
      }
    });

    return NextResponse.json(serviceRequest, { status: 201 });
  } catch (error) {
    console.error('Error requesting new service:', error);
    return NextResponse.json({ error: 'Error requesting new service' }, { status: 500 });
  }
}

// Admin Approves a Partner or Service
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, approve } = body;

    if (type === 'partner') {
      const partner = await prisma.partner.update({
        where: { id },
        data: { approved: approve }
      });
      return NextResponse.json(partner, { status: 200 });
    }

    if (type === 'service') {
      const serviceRequest = await prisma.serviceRequest.update({
        where: { id },
        data: { approved: approve }
      });

      if (approve) {
        await prisma.service.create({
          data: { name: serviceRequest.name }
        });
      }

      return NextResponse.json(serviceRequest, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
