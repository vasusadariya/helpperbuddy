// Helper function to award referral bonus
import prisma from '@/lib/prisma'

export async function awardReferralBonus(userId: string) {
    try {
      const result: { variable_value: number }[] = await prisma.$queryRaw`
            SELECT variable_value FROM system_config 
            WHERE variable_name = 'referral'
          `
      const config = result[0]
      const REFERRAL_BONUS = config.variable_value;
      // Find the user who made the purchase
      const purchaser = await prisma.user.findUnique({
        where: { id: userId },
        select: { referredBy: true }
      });
  
      if (!purchaser?.referredBy) {
        return; // User wasn't referred, no bonus to award
      }
  
      // Award the bonus to the referrer
      await prisma.$transaction(async (tx) => {
        // Get or create wallet for referrer
        const referrerWallet = await tx.wallet.upsert({
          where: { userId: purchaser.referredBy! },
          create: {
            userId: purchaser.referredBy!,
            balance: REFERRAL_BONUS
          },
          update: {
            balance: { increment: REFERRAL_BONUS }
          }
        });
  
        // Create transaction record for the bonus
        await tx.transaction.create({
          data: {
            amount: REFERRAL_BONUS,
            type: 'CREDIT',
            description: 'Referral bonus',
            walletId: referrerWallet.id,
            userId: purchaser.referredBy!
          }
        });
      });
    } catch (error) {
      console.error('Error awarding referral bonus:', error);
      throw error;
    }
  }