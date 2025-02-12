'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import { formatCurrency } from '@/lib/utils/formatCurrency';


interface OrderDetails {
  orderId: string;
  totalAmount: number;
  walletAmount: number;
  remainingAmount: number;
  razorpayOrderId: string;
  razorpayAmount: number;
  status: string;
  razorpayKeyId: string;
  serviceDetails: {
    name: string;
    description: string;
  };
}

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchOrderDetails();
    }
  }, [sessionStatus]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/payment/initiate/${params.orderId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch order details');
      }

      setOrderDetails(data.data);
      
      // If order is already completed, redirect to orders page
      if (data.data.status === 'COMPLETED') {
        router.push('/services?status=success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpay = () => {
    if (!orderDetails?.razorpayOrderId) return;

    const options = {
        key: orderDetails.razorpayKeyId,
        amount: orderDetails.razorpayAmount,
        currency: "INR",
        name: "Helper Buddy",
        description: orderDetails.serviceDetails.name,
        order_id: orderDetails.razorpayOrderId,
        handler: function (response: any) {
          // The payment is handled by the webhook
          setProcessingPayment(true);
          // Redirect to home page with processing status
          router.push('/services?status=payment_processing');
        },
        modal: {
          ondismiss: function() {
            router.push('/services'); // Redirect to home on modal dismiss
          }
        },
        prefill: {
          email: session?.user?.email,
        },
        theme: {
          color: "#2563EB",
        },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      setError('Payment failed. Please try again.');
      router.push('/services?status=payment_failed');
    });
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            onClick={() => router.push('/services')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Return to Services Section
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Payment Details
              </h2>

              {orderDetails && (
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {orderDetails.serviceDetails.name}
                    </h3>
                    <p className="text-gray-600">
                      {orderDetails.serviceDetails.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-medium">
                        {formatCurrency(orderDetails.totalAmount)}
                      </span>
                    </div>

                    {orderDetails.walletAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Wallet Balance Used</span>
                        <span>-{formatCurrency(orderDetails.walletAmount)}</span>
                      </div>
                    )}

                    {orderDetails.remainingAmount > 0 && (
                      <div className="flex justify-between text-lg font-bold border-t pt-4">
                        <span>Amount to Pay</span>
                        <span>{formatCurrency(orderDetails.remainingAmount)}</span>
                      </div>
                    )}
                  </div>

                  {orderDetails.remainingAmount > 0 && (
                    <button
                      onClick={initializeRazorpay}
                      disabled={processingPayment}
                      className={`w-full ${
                        processingPayment 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white py-3 px-4 rounded-lg transition-colors duration-200`}
                    >
                      {processingPayment ? 'Processing Payment...' : 'Pay Now'}
                    </button>
                  )}

                  {orderDetails.status === 'COMPLETED' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 font-medium">
                        Payment Completed Successfully
                      </p>
                      <button 
                        onClick={() => router.push('/services?status=payment_success')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        View Orders
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}