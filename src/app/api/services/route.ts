import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isAuthenticated, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany()
    return NextResponse.json(services, { status: 200 })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      select: {
        name: true,
        price: true,
      },
    });
    return new Response(JSON.stringify(services), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch services' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}