import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Read raw body text because we need to verify the signature.
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify the signature using your Razorpay webhook secret.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (!signature || signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }


    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;


      const updatedOrder = await prisma.order.update({
        where: { razorpayOrderId: payment.order_id },
        data: {
          status: "COMPLETED",

        },
        include: {
          user: {
            select: { email: true },
          },
          service: {
            select: { name: true },
          },
        },
      });

      // If the order was found and updated, send a confirmation email.
      if (updatedOrder) {
        // Configure Nodemailer to send mail via Mailtrap (example).
        const transporter = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
          },
        });

        // Construct the message text (customize to match your app's needs).
        const messageText = `
Thank you for your purchase!

Order Details:
- Order ID: ${updatedOrder.id.slice(-6)}
- Service: ${updatedOrder.service?.name}
- Price: ₹${updatedOrder.amount?.toFixed(2)}

Your service is now available. Thank you for shopping with us!
`.trim();

        await transporter.sendMail({
          from: '"ImageKit Shop" <noreply@imagekitshop.com>',
          to: updatedOrder.user.email,
          subject: "Payment Confirmation - ImageKit Shop",
          text: messageText,
        });
      }
    }

    // Respond to Razorpay that the webhook was processed successfully.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}