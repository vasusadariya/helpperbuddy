import { Prisma } from "@prisma/client";

export async function handleWalletTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  orderId: string
) {
  const wallet = await tx.wallet.findUnique({
    where: { userId }
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // Update wallet balance
  const updatedWallet = await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { decrement: amount },
      updatedAt: new Date()
    }
  });

  // Create transaction record
  await tx.transaction.create({
    data: {
      id: crypto.randomUUID(),
      amount: amount,
      type: 'DEBIT',
      description: `Payment for order ${orderId}`,
      walletId: wallet.id,
      userId: userId,
      createdAt: new Date()
    }
  });

  return updatedWallet;
}