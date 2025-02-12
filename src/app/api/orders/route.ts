import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/options";
import { awardReferralBonus } from "../refferals/route";  

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        timestamp: currentUTCTime 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        timestamp: currentUTCTime 
      }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { 
        service: true,
        transaction: true,
        Partner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        orders,
        timestamp: currentUTCTime
      }
    });
  } catch (error) {
    const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Error fetching orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        details: "Valid session required",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    const body = await req.json();
    const { serviceId, date, time, remarks, address, pincode } = body;

    // Validate required fields
    if (!serviceId || !date || !time || !address || !pincode) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        received: { serviceId, date, time, remarks, address, pincode },
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Check for eligible partners in the area
    const eligiblePartners = await prisma.partner.findMany({
      where: {
        approved: true,
        AND: [
          {
            serviceProvider: {
              some: {
                serviceId: serviceId
              }
            }
          },
          {
            partnerPincode: {
              some: {
                pincode: pincode
              }
            }
          }
        ]
      }
    });

    if (eligiblePartners.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No service providers available in your area",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({
        success: false,
        error: "Service not found",
        serviceId,
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });

    // Calculate amounts
    const totalAmount = service.price;
    const walletAmount = wallet ? Math.min(wallet.balance, totalAmount) : 0;
    const remainingAmount = totalAmount - walletAmount;

    // Use transaction to handle wallet deduction and order creation
    const result = await prisma.$transaction(async (tx) => {
      // Create order first
      const order = await tx.order.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          date: new Date(date),
          time: time,
          remarks: remarks || "",
          address : "",
          pincode : "",
          amount: totalAmount,
          walletAmount: walletAmount,
          remainingAmount: remainingAmount,
          status: 'PENDING'
        }
      });

      let transaction = null;

      // Handle wallet payment if available
      if (walletAmount > 0 && wallet) {
        // Deduct from wallet
        await tx.wallet.update({
          where: { userId: user.id },
          data: {
            balance: { decrement: walletAmount }
          }
        });

        // Create wallet transaction record
        transaction = await tx.transaction.create({
          data: {
            amount: walletAmount,
            type: 'DEBIT',
            description: `Payment for ${service.name}`,
            walletId: wallet.id,
            userId: user.id,
            orderId: order.id
          }
        });
      }

      let razorpayOrder = null;
      let updatedOrder = order;

      if (remainingAmount > 0) {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(remainingAmount * 100),
          currency: "INR",
          receipt: `order_rcpt_${order.id}`,
          notes: {
            orderId: order.id,
            serviceId: serviceId,
            userId: user.id
          }
        });

        updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrder.id }
        });
      } else {
        updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' }
        });

        try {
          await awardReferralBonus(user.id);
        } catch (bonusError) {
          console.error('Error awarding referral bonus:', bonusError);
        }
      }

      // Increment service order count
      await tx.service.update({
        where: { id: serviceId },
        data: {
          numberoforders: {
            increment: 1
          }
        }
      });

      return { order: updatedOrder, transaction, razorpayOrder };
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.order.id,
        totalAmount,
        walletAmount,
        remainingAmount,
        razorpayOrderId: result.razorpayOrder?.id,
        razorpayAmount: remainingAmount > 0 ? Math.round(remainingAmount * 100) : 0,
        status: result.order.status,
        walletTransaction: result.transaction,
        serviceDetails: {
          name: service.name,
          description: service.description
        },
        address: result.order.address,
        pincode: result.order.pincode,
        eligiblePartners: eligiblePartners.length,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create order",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        timestamp: currentUTCTime
      }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status, razorpayPaymentId } = body;

    if (!orderId || !status) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        timestamp: currentUTCTime
      }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true }
    });

    if (!currentOrder) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
        timestamp: currentUTCTime
      }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = { status };
      
      if (status === 'COMPLETED' && razorpayPaymentId) {
        updateData.razorpayPaymentId = razorpayPaymentId;
        updateData.paidAt = new Date();
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData
      });

      if (status === 'COMPLETED') {
        try {
          await awardReferralBonus(currentOrder.userId);
        } catch (error) {
          console.error('Error awarding referral bonus:', error);
        }
      }

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: {
        order: result,
        timestamp: currentUTCTime
      }
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update order",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: currentUTCTime
    }, { status: 500 });
  }
}