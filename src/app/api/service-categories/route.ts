// app/api/service-categories/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Category } from '@prisma/client';

export async function GET() {
  try {
    // First get all categories
    const categories = Object.values(Category);
    
    // Then get all services grouped by category
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        category: true
      }
    });

    // Create a structured response with categories and their services
    const categorizedServices = categories.map(category => ({
      category: category,
      displayName: category.replace(/_/g, ' '),
      services: services.filter(service => service.category === category)
    }));
    
    return NextResponse.json(categorizedServices);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}