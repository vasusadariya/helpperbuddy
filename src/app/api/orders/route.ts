import { isAuthenticated } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  // Check if the requester is authenticated.
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      include: { service: true }
    })
    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error fetching orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Check if the requester is authenticated.
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, serviceId, date, time, remarks } = body

    const order = await prisma.order.create({
      data: { userId, serviceId, date, time, remarks }
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    )
  }
}