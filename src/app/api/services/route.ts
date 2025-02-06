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
  // Check if the requester is an admin.
  const admin = await isAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, description, price, category } = body

    const service = await prisma.service.create({
      data: { name, description, price, category }
    })
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
  }
}