// app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        category: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        services,
        timestamp: currentUTCTime
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: 'Error fetching services',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}