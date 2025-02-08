import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

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

    // Ensure services and pincodes are arrays and store as JSON
    const servicesArray = Array.isArray(services) ? services : [services]
    const pincodesArray = Array.isArray(pincodes) ? pincodes : [pincodes]

    // Check if the partner already exists
    const existingPartner = await prisma.partner.findUnique({
      where: { email },
    })

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Partner with this email already exists' },
        { status: 400 }
      )
    }

    // Hash the provided password with a salt round of 10.
    const hashedPassword = await hash(password, 10)

    // Store services as a JSON string if your column type is `Json` in Prisma
    const partner = await prisma.partner.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        service: servicesArray,  
        pincodes: {
          create: pincodesArray.map(pincode => ({
            pincode: pincode
          }))
        },
        approved: false, // Ensure default approval is false
      }
    })

    return NextResponse.json(
      { 
        id: partner.id, 
        name: partner.name, 
        email: partner.email, 
        approved: partner.approved 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json({ 
      error: 'Error creating partner', 
      details: (error as any).message 
    }, { status: 500 })
  }
}
