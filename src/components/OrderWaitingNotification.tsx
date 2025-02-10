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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Store order data in localStorage when received
  useEffect(() => {
    if (initialOrderData) {
      const orderData = {
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
        date: new Date().toISOString(),
        time: new Date().toTimeString().slice(0, 5)
      };
      localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
    }
  }, [initialOrderData, orderId]);

  // Load order data from localStorage on component mount
  useEffect(() => {
    const savedOrder = localStorage.getItem(`order_${orderId}`);
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, [orderId]);

  useEffect(() => {
    if (session?.user) {
      checkOrderStatus();
      const interval = setInterval(checkOrderStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [session, orderId]);

  const checkOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
        localStorage.setItem(`order_${orderId}`, JSON.stringify(data.data));
        
        if (data.data.status === 'ACCEPTED' || data.data.status === 'COMPLETED') {
          setTimeout(() => {
            onOrderAccepted?.();
            localStorage.removeItem(`order_${orderId}`);
          }, 3000); // Show acceptance message for 3 seconds before removing
        }
        
        if (data.data.status === 'CANCELLED') {
          onOrderCancelled?.();
          localStorage.removeItem(`order_${orderId}`);
        }
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error checking order status:", error);
      setError("Failed to check order status");
    }
  };

  const handleCancelOrder = async () => {
    if (isCancelling || !order) return;

    try {
      setIsCancelling(true);
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
      setError("Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePayment = async () => {
    if (!order?.razorpayOrderId || isProcessingPayment) return;

    setIsProcessingPayment(true);
    
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.razorpayAmount,
        currency: "INR",
        name: "Your Company Name",
        description: `Payment for ${order.service.name}`,
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const result = await fetch("/api/orders", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: orderId,
                status: "COMPLETED",
                razorpayPaymentId: response.razorpay_payment_id
              }),
            });

            const data = await result.json();
            if (data.success) {
              checkOrderStatus();
            } else {
              throw new Error(data.error);
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: session?.user?.email,
          name: session?.user?.name,
        },
        theme: {
          color: "#2563EB",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setError("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-96 border border-gray-200 animate-slide-up">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-lg">Service Booking Status</h3>
          <p className="text-sm text-gray-600">{order.service.name}</p>
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

            {order.razorpayOrderId && order.remainingAmount > 0 && (
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className={`w-full ${
                  isProcessingPayment
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white px-4 py-2 rounded text-sm transition-colors mb-2`}
              >
                {isProcessingPayment ? "Processing..." : `Pay ₹${order.remainingAmount.toFixed(2)}`}
              </button>
            )}

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

        {order.status === 'ACCEPTED' && (
          <div className="text-green-600 flex items-center justify-center space-x-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Order accepted by {order.partner?.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}