// app/api/admin/services/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        ServiceProvider: {
          include: {
            Partner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, category, threshold } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: Number(price),
        category,
        threshold: Number(threshold),
      },
      include: {
        ServiceProvider: {
          include: {
            Partner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
  }
}