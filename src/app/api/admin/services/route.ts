// app/api/admin/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, category, threshold, image } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: Number(price),
        category,
        threshold: Number(threshold),
        image,
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

export async function DELETE(request: NextRequest) {
  try {
    const { id: serviceId } = await request.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // First delete all order entries associated with the service
    await prisma.order.deleteMany({ where: { serviceId } });

    // Then delete all service provider entries
    await prisma.serviceProvider.deleteMany({ where: { serviceId } });

    // Finally, delete the service
    const service = await prisma.service.delete({ where: { id: serviceId } });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Error deleting service' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id: serviceId, name, description, price, category, threshold, isActive, image } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        price: Number(price),
        category,
        threshold: Number(threshold),
        isActive,
        image,
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
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
  }
}