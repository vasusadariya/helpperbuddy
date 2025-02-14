"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  serviceDetails: {
    name: string;
    category: string;
    price: number;
    description: string;
  };
  customerDetails: {
    name: string;
    phone: string;
  };
  orderDetails: {
    date: string;
    time: string;
    address: string;
    pincode: string;
    amount: number;
    remarks: string | null;
  };
  timestamps: {
    created: string;
    updated: string;
  };
}

export default function OrderNotification() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPendingOrders = async () => {
    try {
      setError(null);
      const response = await fetch("/api/partner/pending-orders", {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data); // Debug log
      
      if (data.success) {
        setPendingOrders(data.data.orders);
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

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
        setPendingOrders(orders => orders.filter(order => order.id !== orderId));
        
        // Show success message with email status
        if (!data.data.order.emailNotification.sent) {
          console.warn('Order accepted but email notification failed:', 
            data.data.order.emailNotification.error);
        }
        
        router.refresh();
      } else {
        if (data.error === "Order is no longer available for acceptance") {
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
  
  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const [hours, minutes] = time.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes));
      const formattedTime = timeDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      return { formattedDate, formattedTime };
    } catch (error) {
      console.error('Error formatting date/time:', error);
      return { formattedDate: date, formattedTime: time };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="text-gray-500">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
        <span>New Order Requests</span>
        <span className="text-sm font-normal text-gray-500">
          {pendingOrders.length} pending
        </span>
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {pendingOrders.length === 0 ? (
        <div className="text-center py-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-gray-600">No new orders available at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => {
            const { formattedDate, formattedTime } = formatDateTime(
              order.orderDetails.date,
              order.orderDetails.time
            );

            return (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">
                      {order.serviceDetails.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Category: {order.serviceDetails.category}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    ₹{order.orderDetails.amount.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium">{formattedDate}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium">{formattedTime}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    Customer: {order.customerDetails.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Location: {order.orderDetails.pincode}
                  </p>
                </div>

                {order.orderDetails.remarks && (
                  <div className="mb-3 bg-yellow-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Customer Notes</p>
                    <p className="text-sm">{order.orderDetails.remarks}</p>
                  </div>
                )}

                <button
                  onClick={() => acceptOrder(order.id)}
                  disabled={isAccepting === order.id}
                  className={`w-full ${
                    isAccepting === order.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2`}
                >
                  {isAccepting === order.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <span>Accept Order</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}