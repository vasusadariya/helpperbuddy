import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/options"

const MIN_PURCHASE_FOR_REFERRAL = 100;

export async function POST(request: NextRequest) {
  try {
    const result1: { variable_value: number }[] = await prisma.$queryRaw`
              SELECT variable_value FROM system_config 
              WHERE variable_name = 'referral'
            `
        const config = result1[0]
        const REFERRAL_BONUS = config.variable_value;
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id
    const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const { amount, type = 'CREDIT', description } = await request.json()

    // Input validation
    if (!amount) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'Amount is required',
        timestamp: currentUTCTime
      }, { status: 400 })
    }

    if (amount <= 0 && type === 'CREDIT') {
      return NextResponse.json({
        error: 'Invalid amount',
        details: 'Amount must be greater than 0 for credit transactions',
        timestamp: currentUTCTime
      }, { status: 400 })
    }

    // Use transaction to ensure wallet and transaction updates are atomic
    const result = await prisma.$transaction(async (tx) => {
      // Get wallet (should exist as it's created during authentication)
      const wallet = await tx.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        throw new Error('Wallet not found. Please try logging out and back in');
      }

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
          updatedAt: new Date(currentUTCTime)
        }
      });

      // Create main transaction record
      const mainTransaction = await tx.transaction.create({
        data: {
          id: await prisma.transaction.findMany().then(() => crypto.randomUUID()),
          amount,
          type,
          description: description || `${type.toLowerCase()} transaction`,
          walletId: wallet.id,
          userId,
          createdAt: new Date(currentUTCTime)
        }
      });

      const transactions = [mainTransaction];

      // Handle referral bonus if applicable
      if (user.referredBy && type === 'CREDIT' && amount >= MIN_PURCHASE_FOR_REFERRAL) {
        const referralBonusPaid = await tx.transaction.findFirst({
          where: {
            userId: user.referredBy,
            type: 'REFERRAL_BONUS',
            description: `Referral bonus from ${user.email}`
          }
        });

        if (!referralBonusPaid) {
          const referrerWallet = await tx.wallet.findUnique({
            where: { userId: user.referredBy }
          });

          if (referrerWallet) {
            const updatedReferrerWallet = await tx.wallet.update({
              where: { id: referrerWallet.id },
              data: { balance: { increment: REFERRAL_BONUS } }
            });
            console.log('Updated referrer wallet:', updatedReferrerWallet);
            const referralBonusTransaction = await tx.transaction.create({
              data: {
                id: crypto.randomUUID(),
                amount: REFERRAL_BONUS,
                type: 'REFERRAL_BONUS',
                description: `Referral bonus from ${user.email}`,
                walletId: referrerWallet.id,
                userId: user.referredBy,
                createdAt: new Date(currentUTCTime)
              }
            });
            transactions.push(referralBonusTransaction);
          }
        }
      }

      return {
        updatedWallet,
        allTransactions: transactions
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          id: result.updatedWallet.id,
          balance: result.updatedWallet.balance,
          userId: result.updatedWallet.userId,
          createdAt: result.updatedWallet.createdAt,
          updatedAt: result.updatedWallet.updatedAt
        },
        transactions: result.allTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          description: t.description,
          createdAt: t.createdAt,
          walletId: t.walletId,
          userId: t.userId
        })),
        timestamp: currentUTCTime
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json({
      error: 'Error updating wallet',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id
    const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

    // Get wallet with recent transactions
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transaction: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Get last 10 transactions
        }
      }
    });

    if (!wallet) {
      return NextResponse.json({
        error: 'Wallet not found',
        userId,
        timestamp: currentUTCTime
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet : {
          balance: wallet?.balance || 0,
          transactions: wallet?.transaction || []
        },
        timestamp: currentUTCTime
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json({
      error: 'Error fetching wallet',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id
    const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const {
      startDate,
      endDate,
      type,
      page = 1,
      limit = 10
    } = await request.json();

    // Build where clause for filtering
    type TransactionType = 'CREDIT' | 'DEBIT' | 'REFERRAL_BONUS';
    const where: { userId: string; createdAt?: { gte: Date; lte: Date }; type?: TransactionType } = { userId };

    if (startDate && endDate) {
      where['createdAt'] = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    // Get transactions with pagination
    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          Wallet: true
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: currentUTCTime
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({
      error: 'Error fetching transactions',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }, { status: 500 })
  }
}