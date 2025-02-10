"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WaitingForPartner({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const maxWaitTime = 300; // 5 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const checkOrderStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${params.orderId}/status`);
        const data = await response.json();

        if (data.success) {
          if (data.data.status === 'ACCEPTED' && data.data.partnerId) {
            // Partner found, redirect to payment
            router.push(`/payment/${params.orderId}`);
          } else if (data.data.status === 'CANCELLED') {
            alert('Sorry, no partners are available at the moment. Please try again later.');
            router.push('/services');
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    };

    // Check status every 5 seconds
    interval = setInterval(() => {
      checkOrderStatus();
      setElapsedTime(prev => {
        if (prev >= maxWaitTime) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 5000);

    // Set timeout for 5 minutes
    timeout = setTimeout(() => {
      clearInterval(interval);
      fetch(`/api/orders/${params.orderId}/cancel`, { method: 'POST' })
        .finally(() => {
          alert('Sorry, no partners are available at the moment. Please try again later.');
          router.push('/services');
        });
    }, maxWaitTime * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [params.orderId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-4">Finding a Service Partner</h2>
        <p className="text-gray-600 mb-4">
          Please wait while we connect you with the best service partner...
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(elapsedTime / maxWaitTime) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Estimated waiting time: {Math.max(0, Math.ceil((maxWaitTime - elapsedTime) / 60))} minutes
        </p>
      </div>
    </div>
  );
}