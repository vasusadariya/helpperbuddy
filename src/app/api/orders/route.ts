import { NextRequest } from "next/server";
import { handleGetOrders } from "./handlers/getOrders";
import { handleCreateOrder } from "./handlers/createOrder";
import { handleUpdateOrder } from "./handlers/updateOrder";
import { handleDeleteOrder } from "./handlers/deleteOrder";

export async function GET() {
  return handleGetOrders();
}

export async function POST(req: NextRequest) {
  return handleCreateOrder(req);
}

export async function PATCH(req: NextRequest) {
  return handleUpdateOrder(req);
}

export async function DELETE(req: NextRequest) {
  return handleDeleteOrder(req);
}