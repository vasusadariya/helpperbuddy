import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function handleDeleteOrder(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('id');
    // Delete the order
    const order = await prisma.order.delete({
      where: {
        id: orderId || "",
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