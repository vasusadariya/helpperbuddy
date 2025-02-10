import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.partnerRequestedService.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error('Error fetching partner requested services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
