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

    const { orderId, status } = await req.json();

    // Verify partner owns this order
    const partner = await prisma.partner.findFirst({
      where: { email: session.user.email }
    });

    if (!partner) {
      return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        partnerId: partner.id
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const now = new Date();
    const updateData: any = {
      status: status
    };

    if (status === 'IN_PROGRESS') {
      updateData.startedAt = now;
    } else if (status === 'COMPLETED') {
      updateData.completedAt = now;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}