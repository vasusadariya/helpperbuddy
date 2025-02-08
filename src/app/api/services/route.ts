import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, price, category } = await request.json();

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'All fields (name, description, price, category) are required' },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate name and description are strings
    if (typeof name !== 'string' || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Name and description must be strings' },
        { status: 400 }
      );
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price,
        category,
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}