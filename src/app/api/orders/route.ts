import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/options";
import { awardReferralBonus } from "../refferals/route";
import { sendNewOrderToEligiblePartners } from "../services/emailServices/route";

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const validateServerDateTime = (
  dateTimeString: string,
  timeString: string
): { isValid: boolean; error?: string } => {
  try {
    // Parse the incoming ISO date string
    const selectedDateTime = new Date(dateTimeString);
    const now = new Date();

    // Check if the date and time are valid
    if (isNaN(selectedDateTime.getTime())) {
      return { isValid: false, error: "Please enter a valid date and time" };
    }

    // Check if the date is in the past
    if (selectedDateTime < now) {
      const isToday = selectedDateTime.toDateString() === now.toDateString();
      return {
        isValid: false,
        error: isToday
          ? "Please select a future time for today's bookings"
          : "Please select a future date",
      };
    }

    // Check service hours (8 AM to 8 PM)
    const hour = selectedDateTime.getHours();
    if (hour < 8 || hour >= 20) {
      return {
        isValid: false,
        error: "Our service hours are between 8:00 AM and 8:00 PM",
      };
    }

    // Check if the date is too far in the future (more than 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (selectedDateTime > thirtyDaysFromNow) {
      return {
        isValid: false,
        error: "Bookings can only be made up to 30 days in advance",
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "Please select a valid date and time",
    };
  }
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUTCTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          timestamp: currentUTCTime,
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          timestamp: currentUTCTime,
        },
        { status: 404 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        service: true,
        transaction: true,
        Partner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orders,
        timestamp: currentUTCTime,
      },
    });
  } catch (error) {
    const currentUTCTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching orders",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: currentUTCTime,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const currentUTCTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Valid session required",
          timestamp: currentUTCTime,
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          timestamp: currentUTCTime,
        },
        { status: 404 }
      );
    }

    let body;
    try {
      body = await req.json();
      console.log("Request body:", body);
      if (!body) {
        return NextResponse.json(
          {
            success: false,
            error: "Request JSON body is empty or invalid",
            timestamp: currentUTCTime,
          },
          { status: 400 }
        );
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not parse JSON",
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error",
          timestamp: currentUTCTime,
        },
        { status: 400 }
      );
    }

    const {
      serviceId,
      date,
      time,
      remarks = "",
      address,
      pincode,
      amount,
    } = body;

    // Validate required fields
    if (!serviceId || !date || !time || !address || !pincode) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: {
            serviceId: !serviceId ? "Service ID is required" : null,
            date: !date ? "Date is required" : null,
            time: !time ? "Time is required" : null,
            address: !address ? "Address is required" : null,
            pincode: !pincode ? "Pincode is required" : null,
          },
          timestamp: currentUTCTime,
        },
        { status: 400 }
      );
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pincode format",
          details: "Pincode must be 6 digits",
          timestamp: currentUTCTime,
        },
        { status: 400 }
      );
    }

    // Validate date and time
    const dateTimeValidation = validateServerDateTime(date, time);
    if (!dateTimeValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date or time",
          details: dateTimeValidation.error,
          timestamp: currentUTCTime,
        },
        { status: 400 }
      );
    }

    const bookingDateTime = new Date(date);

    // Check for eligible partners
    const eligiblePartners = await prisma.partner.findMany({
      where: {
        approved: true,
        isActive: true,
        AND: [
          {
            serviceProvider: {
              some: {
                serviceId: serviceId,
                isActive: true,
              },
            },
          },
          {
            partnerPincode: {
              some: {
                pincode: pincode,
                isActive: true,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        // phoneno: true,
      },
    });

    if (eligiblePartners.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No service providers available",
          details: `No service providers available for pincode ${pincode}`,
          timestamp: currentUTCTime,
        },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Service not found",
          timestamp: currentUTCTime,
        },
        { status: 404 }
      );
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    // Calculate amounts
    const totalAmount = service.price;
    const walletAmount = wallet ? Math.min(wallet.balance, totalAmount) : 0;
    const remainingAmount = totalAmount - walletAmount;

    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          date: bookingDateTime,
          time: time,
          remarks: remarks || "",
          address: address,
          pincode: pincode,
          amount: totalAmount,
          walletAmount: walletAmount,
          remainingAmount: remainingAmount,
          status: "PENDING",
        },
        include: { service: true, user: true },
      });

      let notificationResult;
      try {
        // Provide empty string or omit the phone field if not available:
        notificationResult = await sendNewOrderToEligiblePartners({
          orderId: order.id,
          serviceId: order.serviceId,
          serviceName: order.service.name,
          date: order.date,
          time: order.time,
          address: order.address,
          pincode: order.pincode,
          amount: order.amount,
          // phone: order.user.phoneno,
          customer: {
            name: order.user.name,
          },
        });
        console.log("Notification result:", notificationResult);
      } catch (emailError) {
        console.error("Error sending partner notifications:", emailError);
        notificationResult = {
          success: false,
          error:
            emailError instanceof Error
              ? emailError.message
              : "Failed to send notifications",
          partnersCount: 0,
        };
      }

      let transaction = null;
      let razorpayOrder = null;

      // Handle wallet payment
      if (walletAmount > 0 && wallet) {
        await tx.wallet.update({
          where: { userId: user.id },
          data: {
            balance: { decrement: walletAmount },
          },
        });

        transaction = await tx.transaction.create({
          data: {
            amount: walletAmount,
            type: "DEBIT",
            description: `Payment for ${service.name}`,
            walletId: wallet.id,
            userId: user.id,
            orderId: order.id,
          },
        });
      }

      // Create Razorpay order if needed
      if (remainingAmount > 0) {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(remainingAmount * 100),
          currency: "INR",
          receipt: `order_rcpt_${order.id}`,
          notes: {
            orderId: order.id,
            serviceId: serviceId,
            userId: user.id,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrder.id },
        });
      } else {
        // Mark order as completed if wallet covers full amount
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            paidAt: new Date(),
          },
        });

        try {
          await awardReferralBonus(user.id);
        } catch (bonusError) {
          console.error("Error awarding referral bonus:", bonusError);
        }
      }

      // Increment service order count
      await tx.service.update({
        where: { id: serviceId },
        data: { numberoforders: { increment: 1 } },
      });

      return {
        order,
        transaction,
        razorpayOrder,
        notificationSent: notificationResult?.success ?? false,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.order.id,
        totalAmount,
        walletAmount,
        remainingAmount,
        razorpayOrderId: result.razorpayOrder?.id,
        razorpayAmount:
          remainingAmount > 0 ? Math.round(remainingAmount * 100) : 0,
        status: result.order.status,
        walletTransaction: result.transaction,
        serviceDetails: {
          // Use the order's included service to avoid any scope issues
          name: result.order.service?.name || "",
          description: result.order.service?.description || "",
        },
        bookingDetails: {
          date: bookingDateTime.toISOString().split("T")[0],
          time: time,
          address: result.order.address,
          pincode: result.order.pincode,
        },
        eligiblePartners: eligiblePartners.length,
        notificationStatus: result.notificationSent ?? false,
        timestamp: currentUTCTime,
      },
    });
  } catch (error) {
    console.error("arre yaar:", error);

    const errorResponse = {
      success: false,
      error: "Failed to create order",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: currentUTCTime,
    };

    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }

    // Specific error handling for Razorpay errors
    if (error && typeof error === 'object' && 'code' in error) {
      const typedError = error as { code: string; description?: string };
      if (typedError.code === 'ayya') {
        return NextResponse.json({
          success: false,
          error: "Invalid argument type in payment processing",
          details: typedError.description || "Payment processing failed",
          timestamp: currentUTCTime
        }, { status: 400 });
      }
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const currentUTCTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          timestamp: currentUTCTime,
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, status, razorpayPaymentId } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          timestamp: currentUTCTime,
        },
        { status: 400 }
      );
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
          timestamp: currentUTCTime,
        },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = { status };

      if (status === "COMPLETED" && razorpayPaymentId) {
        updateData.razorpayPaymentId = razorpayPaymentId;
        updateData.paidAt = new Date();
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      if (status === "COMPLETED") {
        try {
          await awardReferralBonus(currentOrder.userId);
        } catch (error) {
          console.error("Error awarding referral bonus:", error);
        }
      }

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: {
        order: result,
        timestamp: currentUTCTime,
      },
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: currentUTCTime,
      },
      { status: 500 }
    );
  }
}
