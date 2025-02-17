import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all active services with their names
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
      },
    });

    // Sort the services by the length of their name in ascending order
    const sortedServices = services.sort((a, b) => a.name.length - b.name.length);

    // Limit the results to the first 2 services with the shortest names
    const shortestServices = sortedServices.slice(0, 2);

    return NextResponse.json({
      success: true,
      data: shortestServices,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: 'Error fetching services',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
