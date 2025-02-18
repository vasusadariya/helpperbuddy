"use client";

import { useState } from 'react';
import { CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentOptionsProps {
  order: {
    id: string;
    amount: number;
    remainingAmount: number;
    status: string;
  };
  onPaymentComplete: () => void;
}

export const PaymentOptions = ({ order, onPaymentComplete }: PaymentOptionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCodMessage, setShowCodMessage] = useState(false);

  const handlePaymentMethod = async (method: 'ONLINE' | 'COD') => {
    setIsProcessing(true);
    try {
      if (method === 'ONLINE') {
        // Handle online payment
        const response = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: order.id,
            paymentMode: 'ONLINE'
          })
        });

        const data = await response.json();
        if (data.success) {
          // Initialize Razorpay
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: "INR",
            order_id: data.razorpayOrderId,
            name: "Service Payment",
            description: "Payment for completed service",
            handler: function(response: any) {
              onPaymentComplete();
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      } else {
        // Handle COD
        const response = await fetch('/api/payment/cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: order.id,
            paymentMode: 'COD'
          })
        });

        const data = await response.json();
        if (data.success) {
          setShowCodMessage(true);
          toast.success(data.data.message || 'Cash on Delivery option selected');
          onPaymentComplete();
        } else {
          throw new Error(data.error || 'Failed to process COD request');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-3">
          Select Payment Method
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={() => handlePaymentMethod('ONLINE')}
            disabled={isProcessing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Online
          </button>
          <button
            onClick={() => handlePaymentMethod('COD')}
            disabled={isProcessing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            <Banknote className="w-4 h-4 mr-2" />
            Cash on Delivery
          </button>
        </div>
      </div>

      {showCodMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Banknote className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Cash Payment Instructions
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Please pay ₹{order.amount.toFixed(2)} to the service provider
              </p>
              <p className="mt-2 text-xs text-blue-600">
                A transaction record will be created once the payment is confirmed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};