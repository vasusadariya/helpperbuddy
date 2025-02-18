import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const { id: partnerId } = await context.params;

    // First, get the partner's email to find the corresponding user
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { email: true }
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    // Find the corresponding user
    const user = await prisma.user.findUnique({
      where: { email: partner.email }
    });

    await prisma.$transaction(async (tx) => {
      // 1. Delete PartnerPincodes
      await tx.partnerPincode.deleteMany({
        where: { partnerId }
      });

      // 2. Delete ServiceProvider entries
      await tx.serviceProvider.deleteMany({
        where: { partnerId }
      });

      // 3. Delete PartnerRequestedService entries
      await tx.partnerRequestedService.deleteMany({
        where: { partnerId }
      });

      // 4. Update Orders to remove partner reference
      await tx.order.updateMany({
        where: { partnerId },
        data: { 
          partnerId: null,
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      // 5. Delete the Partner
      await tx.partner.delete({
        where: { id: partnerId }
      });

      // 6. If corresponding user exists, delete user and related data
      if (user) {
        // Delete user's transactions
        await tx.transaction.deleteMany({
          where: { userId: user.id }
        });

        // Delete user's wallet
        await tx.wallet.delete({
          where: { userId: user.id }
        }).catch(() => {
          // Ignore if wallet doesn't exist
        });

        // Delete the user
        await tx.user.delete({
          where: { id: user.id }
        });
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Partner and all related data deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete partner",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}