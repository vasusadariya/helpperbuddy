import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Check if the requester is authenticated.
  const auth = await isAuthenticated(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { referralCode, newUserId } = body

    const referrer = await prisma.user.findUnique({
      where: { referralCode }
    })

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id }
    })

    // Add bonus to referrer's wallet. Assuming bonus amount is 100.
    await prisma.wallet.upsert({
      where: { userId: referrer.id },
      update: { balance: { increment: 100 } },
      create: { userId: referrer.id, balance: 100 }
    })

    return NextResponse.json({ message: 'Referral processed successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error processing referral:', error)
    return NextResponse.json({ error: 'Error processing referral' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Only POST is allowed for this endpoint.
  return NextResponse.json({ error: `Method ${request.method} Not Allowed` }, { status: 405 })
}