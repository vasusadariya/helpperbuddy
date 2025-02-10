import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { serviceId, userId } = req.body;

    try {
      const order = await prisma.order.create({
        data: {
          service: { connect: { id: serviceId } },
          user: { connect: { id: userId } },
          status: "PENDING",
          date: new Date(), // Add the current date
          time: new Date().toISOString(), // Add the current time in ISO format
        },
      });

      res.status(200).json({ success: true, orderId: order.id });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ success: false, error: "Failed to create order" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}