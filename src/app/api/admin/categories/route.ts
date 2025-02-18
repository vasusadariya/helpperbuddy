import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all unique categories from existing services
    const services = await prisma.service.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = services.map(service => service.category);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}
