"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from 'date-fns';

interface Order {
  id: string;
  service: {
    name: string;
    price: number;
  };
  user: {
    name: string;
    email: string;
  };
  date: string;
  time: string;
  status: string;
  amount: number;
  remarks?: string;
}

export default function OrderNotification() {
  const { data: session } = useSession();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchPendingOrders();
      // Poll for new orders every 10 seconds
      const interval = setInterval(fetchPendingOrders, 10000);
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
      setIsAccepting(orderId);
      const response = await fetch("/api/partner/accept-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      if (data.success) {
        // Remove the accepted order from the list
        setPendingOrders(orders => orders.filter(order => order.id !== orderId));
        alert("Order accepted successfully!");
      } else {
        // Order might have been taken by another partner
        if (data.error === "Order no longer available") {
          setPendingOrders(orders => orders.filter(order => order.id !== orderId));
          alert("This order has already been accepted by another partner");
        } else {
          alert(data.error || "Failed to accept order");
        }
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order. Please try again.");
    } finally {
      setIsAccepting(null);
    }
  };

  if (pendingOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">New Order Requests</h2>
      <div className="space-y-4">
        {pendingOrders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-lg">{order.service.name}</h3>
                <p className="text-sm text-gray-600">Customer: {order.user.name}</p>
              </div>
              <span className="text-lg font-semibold text-green-600">
                ₹{order.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(order.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium">
                  {format(new Date(`2000-01-01T${order.time}`), 'hh:mm a')}
                </p>
              </div>
            </div>

            {order.remarks && (
              <div className="mb-3 bg-yellow-50 p-2 rounded">
                <p className="text-xs text-gray-500">Remarks</p>
                <p className="text-sm">{order.remarks}</p>
              </div>
            )}

            <button
              onClick={() => acceptOrder(order.id)}
              disabled={isAccepting === order.id}
              className={`w-full ${
                isAccepting === order.id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-4 py-2 rounded text-sm transition-colors`}
            >
              {isAccepting === order.id ? "Accepting..." : "Accept Order"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}