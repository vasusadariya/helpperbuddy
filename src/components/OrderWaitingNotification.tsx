"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from 'date-fns';

interface OrderStatus {
  id: string;
  status: string;
  amount: number;
  remainingAmount: number;
  walletAmount: number;
  razorpayOrderId?: string;
  razorpayAmount: number;
  service: {
    name: string;
    price: number;
  };
  partner: {
    name: string;
    phoneno?: string;  // Added partner phone number
  } | null;
  date: string;
  time: string;
}

interface OrderWaitingNotificationProps {
  orderId: string;
  onOrderAccepted?: () => void;
  onOrderCancelled?: () => void;
  initialOrderData?: {
    totalAmount: number;
    walletAmount: number;
    remainingAmount: number;
    razorpayOrderId?: string;
    razorpayAmount: number;
    serviceDetails: {
      name: string;
      description: string;
    };
    date: string;
    time: string;
  };
}

export default function OrderWaitingNotification({ 
  orderId,
  onOrderAccepted,
  onOrderCancelled,
  initialOrderData 
}: OrderWaitingNotificationProps) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showAcceptedMessage, setShowAcceptedMessage] = useState(false);
  const [dismissTimeout, setDismissTimeout] = useState<NodeJS.Timeout | null>(null);

  const checkOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch order status');
      }

      const data = await response.json();
      
      if (data.success) {
        const updatedOrder = data.data;
        setOrder(updatedOrder);
        localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
        
        if (updatedOrder.status === 'ACCEPTED' && !showAcceptedMessage) {
          setShowAcceptedMessage(true);
          // Set a timeout to dismiss the notification after 5 seconds
          const timeoutId = setTimeout(() => {
            onOrderAccepted?.();
          }, 5000);
          setDismissTimeout(timeoutId);
        } else if (updatedOrder.status === 'CANCELLED') {
          localStorage.removeItem(`order_${orderId}`);
          onOrderCancelled?.();
        }
      } else {
        setError(data.error || 'Failed to get order status');
      }
    } catch (error) {
      console.error("Error checking order status:", error);
      setError(error instanceof Error ? error.message : "Failed to check order status");
    }
  };

  // Initialize or load order data
  useEffect(() => {
    const initializeOrder = () => {
      // Try to load from localStorage first
      const savedOrder = localStorage.getItem(`order_${orderId}`);
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
        return;
      }

      // If no saved order but we have initial data, create new order
      if (initialOrderData) {
        const newOrder: OrderStatus = {
          id: orderId,
          status: 'PENDING',
          amount: initialOrderData.totalAmount,
          remainingAmount: initialOrderData.remainingAmount,
          walletAmount: initialOrderData.walletAmount,
          razorpayOrderId: initialOrderData.razorpayOrderId,
          razorpayAmount: initialOrderData.razorpayAmount,
          service: {
            name: initialOrderData.serviceDetails.name,
            price: initialOrderData.totalAmount
          },
          partner: null,
          date: initialOrderData.date,
          time: initialOrderData.time
        };
        setOrder(newOrder);
        localStorage.setItem(`order_${orderId}`, JSON.stringify(newOrder));
      }
    };

    initializeOrder();
  }, [orderId, initialOrderData]);

  // Status polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollStatus = () => {
      if (session?.user) {
        checkOrderStatus();
        intervalId = setInterval(checkOrderStatus, 5000);
      }
    };

    pollStatus();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (dismissTimeout) {
        clearTimeout(dismissTimeout);
      }
    };
  }, [session, orderId, checkOrderStatus, dismissTimeout]);

  const handleCancelOrder = async () => {
    if (isCancelling || !order) return;

    try {
      setIsCancelling(true);
      setError(null);

      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "CANCELLED"
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem(`order_${orderId}`);
        onOrderCancelled?.();
      } else {
        throw new Error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-96 border border-gray-200 animate-slide-up z-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-lg">Service Booking Status</h3>
          <p className="text-sm text-gray-600">{order.service.name}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(order.date), 'MMM dd, yyyy')} at {format(new Date(`2000-01-01T${order.time}`), 'hh:mm a')}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-green-600">
            ₹{order.amount.toFixed(2)}
          </span>
          {order.walletAmount > 0 && (
            <p className="text-xs text-gray-500">
              (Wallet: ₹{order.walletAmount.toFixed(2)})
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {order.status === 'PENDING' && (
          <>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
              <span>Waiting for service provider...</span>
            </div>

            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className={`w-full ${
                isCancelling
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              } text-white px-4 py-2 rounded text-sm transition-colors`}
            >
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          </>
        )}

        {order.status === 'ACCEPTED' && order.partner && (
          <div className="space-y-3">
            <div className="text-green-600 flex items-center justify-center space-x-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Order accepted!</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Service Provider Details</h4>
              <div className="space-y-1 text-sm">
                <p className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {order.partner.name}
                </p>
                {order.partner.phoneno && (
                  <p className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {order.partner.phoneno}
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              This notification will close in a few seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}