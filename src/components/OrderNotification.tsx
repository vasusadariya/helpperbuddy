"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  service: {
    name: string;
    price: number;
    category: string;
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
  partnerId: string | null;
}

export default function OrderNotification() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchPendingOrders();
      const interval = setInterval(fetchPendingOrders, 5000); // Reduced to 5 seconds for better responsiveness
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch("/api/partner/pending-orders");
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      if (data.success) {
        // Filter out any orders that already have a partnerId
        const availableOrders = data.data.orders.filter((order: Order) => !order.partnerId);
        setPendingOrders(availableOrders);
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch orders");
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      setIsAccepting(orderId);
      setError(null);

      const response = await fetch("/api/partner/accept-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the accepted order from the local state
        setPendingOrders(orders => orders.filter(order => order.id !== orderId));
        // Redirect to the order details page
        // router.push(`/partner/orders/${orderId}`);
      } else {
        if (data.error === "Order is no longer available") {
          // Remove the order from local state if it's no longer available
          setPendingOrders(orders => orders.filter(order => order.id !== orderId));
          setError("This order has already been accepted by another partner");
        } else {
          setError(data.error || "Failed to accept order");
        }
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      setError("Failed to accept order. Please try again.");
    } finally {
      setIsAccepting(null);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return format(date, 'hh:mm a');
    } catch (error) {
      return timeString;
    }
  };

  if (pendingOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-600">No new orders available at the moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">New Order Requests</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {pendingOrders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-lg">{order.service.name}</h3>
                <p className="text-sm text-gray-600">Customer: {order.user.name}</p>
                <p className="text-xs text-gray-500">Category: {order.service.category}</p>
              </div>
              <span className="text-lg font-semibold text-green-600">
                ₹{order.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {format(parseISO(order.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium">
                  {formatTime(order.time)}
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