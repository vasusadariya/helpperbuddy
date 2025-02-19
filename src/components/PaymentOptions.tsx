"use client";

import { useState } from 'react';
import { CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface PaymentOptionsProps {
  order: {
    id: string;
    amount: number;
    remainingAmount: number;
    status: string;
  };
  onPaymentComplete: () => void;
}

  // interface Window {
  //   Razorpay: any;
  // }

export const PaymentOptions = ({ order, onPaymentComplete }: PaymentOptionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCodMessage, setShowCodMessage] = useState(false);
  const router = useRouter();

  const handlePaymentMethod = async (method: 'ONLINE' | 'COD') => {
    if (method === 'COD') {
      const message = order.status === 'SERVICE_COMPLETED' 
        ? `Please confirm that you will pay ₹${order.amount.toFixed(2)} to complete the service.`
        : `Please confirm that you will pay ₹${order.amount.toFixed(2)} to the service provider in cash.`;
      
      const confirmCod = window.confirm(message);
      if (!confirmCod) {
        return;
      }
    }

    setIsProcessing(true);
    try {
      if (method === 'ONLINE') {
        router.push(`/payment/${order.id}`);
      } else {
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
          const message = order.status === 'SERVICE_COMPLETED'
            ? 'Order completed successfully'
            : `Please pay ₹${order.amount.toFixed(2)} to the service provider`;
          toast.success(message);
          onPaymentComplete();
        } else {
          throw new Error(data.error || 'Failed to process payment');
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
                Please pay ₹{order.amount.toFixed(2)} to the service provider in cash
              </p>
              <div className="mt-2 text-xs space-y-1">
                <p className="text-blue-600">
                  • The payment will be marked as completed once confirmed
                </p>
                <p className="text-blue-600">
                  • A transaction record will be created for your reference
                </p>
                <p className="text-blue-600">
                  • Make sure to get a confirmation from the service provider
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
            <p className="text-sm text-gray-600">Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};