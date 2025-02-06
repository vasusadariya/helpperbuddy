import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'
import { hash } from 'bcrypt'

export async function GET(request: NextRequest) {
  // Check if the requester is an admin.
  const admin = await isAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const partners = await prisma.partner.findMany()
    return NextResponse.json(partners, { status: 200 })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json({ error: 'Error fetching partners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received body:', body) // Debug log

    const { name, email, password, services, pincodes } = body

    if (!name || !email || !password || !services || !pincodes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure services and pincodes are arrays
    const servicesArray = Array.isArray(services) ? services : [services]
    const pincodesArray = Array.isArray(pincodes) ? pincodes : [pincodes]

    // Hash the provided password with a salt round of 10.
    const hashedPassword = await hash(password, 10)

    const partner = await prisma.partner.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        services: servicesArray, 
        pincodes: pincodesArray 
      }
    })

    return NextResponse.json(
      { id: partner.id, name: partner.name, email: partner.email, approved: partner.approved },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json({ error: 'Error creating partner', details: (error as any).message }, { status: 500 })
  }
}