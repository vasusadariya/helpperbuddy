import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { service: true }
    });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, date, time, remarks } = await req.json();

    // Fetch the service to get its price
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(service.price * 100),
      currency: "INR", // or "USD" based on your setup
      receipt: `receipt_${Date.now()}`,
      notes: {
        serviceId: serviceId,
      },
    });

    // Store the new order in the database using Prisma
    const newOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        serviceId: serviceId,
        date: new Date(date),
        time: time,
        remarks: remarks,
        razorpayOrderId: razorpayOrder.id,
        amount: service.price,
        currency: razorpayOrder.currency,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder.id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}