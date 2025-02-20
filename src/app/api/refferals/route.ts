import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/options"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { referralCode } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has a referrer
    if (currentUser.referredBy) {
      return NextResponse.json({ error: 'User already has a referrer' }, { status: 400 })
    }

    // Find referrer by referral code
    const referrer = await prisma.user.findFirst({
      where: { referralCode }
    })

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Can't refer yourself
    if (referrer.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
    }

    // Update user's referredBy field
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { referredBy: referrer.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully'
    })

  } catch (error) {
    console.error('Error applying referral:', error)
    return NextResponse.json({ error: 'Error applying referral' }, { status: 500 })
  }
}

// Get user's referral information
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        referralCode: true,
        referredBy: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get referral statistics
    const [referredUsers, totalEarnings] = await prisma.$transaction([
      // Count users referred by current user
      prisma.user.count({
        where: { referredBy: user.id }
      }),
      // Sum of referral bonus transactions
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'CREDIT',
          description: 'Referral bonus'
        },
        _sum: {
          amount: true
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        statistics: {
          referredUsers,
          totalEarnings: totalEarnings._sum.amount || 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching referral info:', error)
    return NextResponse.json({ error: 'Error fetching referral info' }, { status: 500 })
  }
}

