import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    let { name, email, password, services, pincodes } = body;

    if (!name || !email || !password || !services || !pincodes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure services is an array
    const servicesArray = Array.isArray(services) ? services : services.split(',').map((s: string) => s.trim());
    const pincodesArray = Array.isArray(pincodes) ? pincodes.map(p => p.trim()) : [pincodes.trim()];

    console.log('Processed services:', servicesArray);
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

    // Create partner first
    const partner = await prisma.partner.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        service: servicesArray,  
        approved: false
      }
    });

    console.log('Partner created:', partner.id);

    // Insert pincodes separately
    if (pincodesArray.length > 0) {
      await prisma.partnerPincode.createMany({
        data: pincodesArray.map(pincode => ({
          partnerId: partner.id,
          pincode: pincode
        }))
      });
    }

    return NextResponse.json(
      { id: partner.id, name: partner.name, email: partner.email, approved: partner.approved },
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