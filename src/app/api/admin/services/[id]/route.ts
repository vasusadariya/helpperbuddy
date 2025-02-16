import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: serviceId } = await context.params;

    // First delete all service provider entries
    await prisma.serviceProvider.deleteMany({
      where: {
        serviceId: serviceId,
      },
    });

    // Then delete the service
    const service = await prisma.service.delete({
      where: {
        id: serviceId,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Error deleting service' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: serviceId } = await context.params;
    const body = await req.json();
    const { name, description, price, category, threshold, isActive } = body;

    const service = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        name,
        description,
        price: Number(price),
        category,
        threshold: Number(threshold),
        isActive,
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
    return NextResponse.json(
      { error: 'Error updating service' },
      { status: 500 }
    );
  }
}