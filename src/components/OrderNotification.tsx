// components/OrderNotification.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Order {
  id: string;
  service: {
    name: string;
  };
  user: {
    name: string;
  };
  date: string;
  time: string;
  status: string;
}

export default function OrderNotification() {
  const { data: session } = useSession();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchPendingOrders();
      // Poll for new orders every 30 seconds
      const interval = setInterval(fetchPendingOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch("/api/partner/pending-orders");
      const data = await response.json();
      if (data.success) {
        setPendingOrders(data.data.orders);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: "ACCEPTED",
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Remove the accepted order from the list
        setPendingOrders(orders => orders.filter(order => order.id !== orderId));
        // Optional: Show success message
        alert("Order accepted successfully!");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order. Please try again.");
    }
  };

  if (pendingOrders.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg p-6 border">
      <h3 className="text-lg font-semibold mb-4">New Order Requests</h3>
      <div className="space-y-4">
        {pendingOrders.map((order) => (
          <div key={order.id} className="border-b pb-4">
            <p className="font-medium">{order.service.name}</p>
            <p className="text-sm text-gray-600">Customer: {order.user.name}</p>
            <p className="text-sm text-gray-600">
              Date: {new Date(order.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">Time: {order.time}</p>
            <button
              onClick={() => acceptOrder(order.id)}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Accept Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}