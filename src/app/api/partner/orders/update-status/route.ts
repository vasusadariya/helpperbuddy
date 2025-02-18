import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Status } from '@prisma/client';

interface UpdateData {
  status: Status;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export async function POST(req: Request) {
  const currentUTCTime = new Date("2025-02-17 18:59:06");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized',
        timestamp: currentUTCTime 
      }, { status: 401 });
    }

    const { orderId, status } = await req.json();

    // Verify partner owns this order
    const partner = await prisma.partner.findFirst({
      where: { email: session.user.email }
    });

    if (!partner) {
      return NextResponse.json({ 
        success: false, 
        error: 'Partner not found',
        timestamp: currentUTCTime 
      }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        partnerId: partner.id
      }
    });

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found',
        timestamp: currentUTCTime 
      }, { status: 404 });
    }

    // Validate status transitions
    if (status === 'IN_PROGRESS' && 
        !['ACCEPTED', 'PAYMENT_COMPLETED'].includes(order.status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Can only start service for accepted or paid orders',
        timestamp: currentUTCTime 
      }, { status: 400 });
    }

    if (status === 'COMPLETED' && order.status !== 'IN_PROGRESS') {
      return NextResponse.json({ 
        success: false, 
        error: 'Can only complete orders that are in progress',
        timestamp: currentUTCTime 
      }, { status: 400 });
    }

    // Update order status
    const updateData: UpdateData = {
      status,
      updatedAt: currentUTCTime
    };

    if (status === 'IN_PROGRESS') {
      updateData.startedAt = currentUTCTime;
    } else if (status === 'COMPLETED') {
      updateData.completedAt = currentUTCTime;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update order status',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime 
    }, { status: 500 });
  }
}