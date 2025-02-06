import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Verify if the requester is authenticated.
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, amount } = await request.json()

    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: { balance: { increment: amount } },
      create: { userId, balance: amount }
    })
    
    return NextResponse.json(wallet, { status: 200 })
  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json({ error: 'Error updating wallet' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Only POST is allowed for this endpoint.
  return NextResponse.json({ error: `Method ${request.method} Not Allowed` }, { status: 405 })
}