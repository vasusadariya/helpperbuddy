import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { Prisma, PrismaClient } from "@prisma/client";
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
        Service: true,
        Transaction: true,
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

    const { serviceId, date, time, remarks = "", address, pincode } = body;

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

    // Get service details
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

    // Check for eligible partners
    const eligiblePartners = await prisma.partner.findMany({
      where: {
        approved: true,
        isActive: true,
        AND: [
          {
            ServiceProvider: {
              some: {
                serviceId: serviceId,
                isActive: true,
              },
            },
          },
          {
            PartnerPincode: {
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
    
    const totalAmount = service.price;

    // Get wallet balance (but don't deduct yet)
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
      select: {
        balance: true,
        id: true
      }
    });

    // Calculate potential wallet usage (but don't apply yet)
    const walletBalance = wallet?.balance || 0;
    const potentialWalletUse = Math.min(walletBalance, totalAmount);
    const remainingAmount = totalAmount - potentialWalletUse;

    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          Service: {
            connect: { id: serviceId }
          },
          User: {
            connect: { id: user.id }
          },
          date: bookingDateTime,
          time: time,
          remarks: remarks || "",
          address: address,
          pincode: pincode,
          amount: totalAmount,
          walletAmount: potentialWalletUse, // This is what will be deducted later
          remainingAmount: remainingAmount,
          status: "PENDING",
          currency: "INR",
        },
        include: { Service: true, User: true },
      });
    
      // Create Razorpay order for remaining amount
      let razorpayOrder = null;
      if (remainingAmount > 0) {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(remainingAmount * 100),
          currency: "INR",
          receipt: `order_rcpt_${order.id}`,
          notes: {
            orderId: order.id,
            serviceId: serviceId,
            userId: user.id,
            walletAmountToUse: potentialWalletUse
          },
        });
    
        await tx.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrder.id },
        });
      }

      // Increment service order count
      await tx.service.update({
        where: { id: serviceId },
        data: { numberoforders: { increment: 1 } },
      });

      return {
        order,
        razorpayOrder,
        potentialWalletUse,
        remainingAmount
      };
    }, {
      timeout: 10000,
      maxWait: 15000,
    });

  

      // try {
      //   await awardReferralBonus(user.id);
      // } catch (bonusError) {
      //   console.error("Error awarding referral bonus:", bonusError);
      // }
    
      // Send notifications outside transaction
      let notificationResult;
      try {
        notificationResult = await sendNewOrderToEligiblePartners({
          orderId: result.order.id,
          serviceId: serviceId,
          serviceName: service.name,
          date: bookingDateTime,
          time: time,
          address: address,
          pincode: pincode,
          amount: totalAmount,
          customer: {
            name: user.name,
          },
        });
        console.log(`Order ${result.order.id} notification results:`, notificationResult);
      } catch (emailError) {
        console.error(`Error sending notifications for order ${result.order.id}:`, emailError);
        notificationResult = {
          success: false,
          error: emailError instanceof Error ? emailError.message : "Failed to send notifications",
          partnersCount: 0,
        };
      }
    
      // Return success response
    return NextResponse.json({
      success: true,
      data: {
        orderId: result.order.id,
        totalAmount,
        availableWalletBalance: walletBalance,
        potentialWalletUse: result.potentialWalletUse,
        remainingAmount: result.remainingAmount,
        razorpayOrderId: result.razorpayOrder?.id,
        razorpayAmount: result.remainingAmount > 0 ? Math.round(result.remainingAmount * 100) : 0,
        status: result.order.status,
        razorpayKeyId: result.razorpayOrder ? process.env.RAZORPAY_KEY_ID : undefined,
        serviceDetails: {
          name: service.name,
          description: service.description || "",
        },
        bookingDetails: {
          date: bookingDateTime.toISOString().split("T")[0],
          time: time,
          address: address,
          pincode: pincode,
        },
        eligiblePartners: eligiblePartners.length,
        notificationStatus: notificationResult?.success ?? false,
        timestamp: currentUTCTime,
      },
    });

  } catch (error) {
    console.error("Error creating order:", {
      timestamp: currentUTCTime,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle Prisma transaction timeout
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2024') {
        return NextResponse.json({
          success: false,
          error: "Transaction timeout",
          details: "Order processing took too long. Please try again.",
          timestamp: currentUTCTime,
        }, { status: 408 });
      }
    }

    // Handle Razorpay errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return NextResponse.json({
        success: false,
        error: "Payment gateway error",
        details: (error as { description?: string }).description || "Error processing payment",
        timestamp: currentUTCTime,
      }, { status: 400 });
    }

    // Default error response
    return NextResponse.json({
      success: false,
      error: "Failed to create order",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: currentUTCTime,
    }, { status: 500 });
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
      include: { Service: true },
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

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: orderId } = context.params;

    // Delete the order
    const order = await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Error deleting order' },
      { status: 500 }
    );
  }
}