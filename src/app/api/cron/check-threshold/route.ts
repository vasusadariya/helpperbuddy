import prisma from '@/lib/prisma';
import { sendOrderThresholdNotification } from '../../services/emailServices';


export async function GET() {
  try {
    // Find orders that have reached their threshold time without acceptance
    const thresholdOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        partnerId: null,
        createdAt: {
          // Check orders where threshold time has passed
          lt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours is default threshold
        }
      },
      include: {
        service: {
          select: {
            name: true,
            threshold: true
          }
        },
        user: true
      }
    });

    const notifications = await Promise.all(
      thresholdOrders.map(order => 
        sendOrderThresholdNotification({
          user: {
            name: order.user.name,
            email: order.user.email
          },
          order: {
            id: order.id,
            serviceName: order.service.name,
            date: order.date,
            time: order.time,
            address: order.address,
            pincode: order.pincode,
            amount: order.amount,
            createdAt: order.createdAt,
            threshold: Number(order.service.threshold || 2)
          }
        })
      )
    );

    return Response.json({
      success: true,
      processed: notifications.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing threshold notifications:', error);
    return Response.json({
      success: false,
      error: 'Failed to process threshold notifications'
    }, { status: 500 });
  }
}