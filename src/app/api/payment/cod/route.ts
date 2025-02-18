import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    // Verify user owns this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: { email: session.user.email },
        status: 'COMPLETED',
        razorpayPaymentId: null
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found or already paid' }, { status: 404 });
    }

    // Update order with COD payment
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMode: 'COD'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'COD payment confirmed'
    });

  } catch (error) {
    console.error('Error processing COD payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process COD payment' },
      { status: 500 }
    );
  }
}