import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export async function GET() {
  try {
    // Get all referral transactions with user details
    const referralTransactions = await prisma.transaction.findMany({
      where: {
        type: TransactionType.REFERRAL_BONUS
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true,
            referrer: {
              select: {
                id: true,
                name: true,
                email: true,
                referralCode: true
              }
            }
          }
        },
        Wallet: {
          select: {
            balance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const stats = await prisma.$transaction(async (tx) => {
      const totalReferralAmount = await tx.transaction.aggregate({
        where: {
          type: TransactionType.REFERRAL_BONUS
        },
        _sum: {
          amount: true
        }
      });

      const totalUsers = await tx.user.count({
        where: {
          role: 'USER'
        }
      });

      const totalActiveReferrals = await tx.user.count({
        where: {
          referredBy: {
            not: null
          }
        }
      });

      return {
        totalReferralAmount: totalReferralAmount._sum.amount || 0,
        totalUsers,
        totalActiveReferrals
      };
    });

    // Format the referral data
    const formattedReferrals = referralTransactions.map(transaction => ({
      id: transaction.id,
      referrer: transaction.User.referrer ? {
        id: transaction.User.referrer.id,
        name: transaction.User.referrer.name,
        email: transaction.User.referrer.email,
        referralCode: transaction.User.referrer.referralCode
      } : null,
      referred: {
        id: transaction.User.id,
        name: transaction.User.name,
        email: transaction.User.email,
        referralCode: transaction.User.referralCode,
        createdAt: transaction.createdAt.toISOString()
      },
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      walletBalance: transaction.Wallet.balance
    }));

    return NextResponse.json({
      referrals: formattedReferrals,
      stats: stats
    });

  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch referral data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}