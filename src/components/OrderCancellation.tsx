"use client";

import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email: string;
  service: string[];
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
  phoneno?: string;
  isActive: boolean;
  lastActiveAt: Date;
}

interface OrderCancellationStatusProps {
  order: {
    id: string;
    status: string;
    createdAt: Date;
    service: {
      name: string;
      threshold: number;
    };
    date: string | Date;
    time: string;
    amount: number;
    Partner: Partner | null;
  };
}

export const OrderCancellationStatus = ({ order }: OrderCancellationStatusProps) => {
  const [cancellationStatus, setCancellationStatus] = useState<{
    isCancellable: boolean;
    timeRemaining: number;
    thresholdHours: number;
  } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCancellationStatus = async () => {
      if (order.status !== "PENDING" || order.Partner) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/orders/check-cancellable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        });

        const data = await response.json();

        if (data.success) {
          setCancellationStatus({
            isCancellable: data.data.isCancellable,
            timeRemaining: data.data.timeRemaining,
            thresholdHours: data.data.thresholdHours
          });
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error('Error checking cancellation status:', error);
        setError('Failed to check cancellation status');
      } finally {
        setLoading(false);
      }
    };

    checkCancellationStatus();
    const interval = setInterval(checkCancellationStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [order.id, order.status, order.Partner]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });

      const data = await response.json();

      if (data.success) {
        // Instead of reloading the whole page, you could use a callback
        // to update just the order status
        window.location.reload();
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };
  const formatTimeRemaining = (hours: number): string => {
    if (hours <= 0) return "Can be cancelled now";

    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);

    if (fullHours === 0) {
      return `${minutes} minutes until cancellation available`;
    } else if (minutes === 0) {
      return `${fullHours} hour${fullHours > 1 ? 's' : ''} until cancellation available`;
    }
    return `${fullHours} hour${fullHours > 1 ? 's' : ''} and ${minutes} minutes until cancellation available`;
  };

  // Early return for non-pending orders
  if (order.status !== "PENDING") {
    return null;
  }

  // Early return if there's a partner assigned
  if (order.Partner) {
    return null;
  }


  if (loading) {
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 animate-spin" />
          Checking cancellation status...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 rounded-lg">
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!cancellationStatus) {
    return null;
  }

  return (
    <div className="mt-4">
      {cancellationStatus.isCancellable ? (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p className="text-sm text-yellow-800 mb-3">
                No service provider has accepted this order yet.
                You can cancel this order or continue waiting.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isCancelling ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continue Waiting
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-yellow-700">
            Service: {order.service.name}<br />
            Scheduled for: {new Date(order.date).toLocaleDateString()} at {order.time}<br />
            Amount: ₹{order.amount.toFixed(2)}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {formatTimeRemaining(cancellationStatus.timeRemaining)}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Service provider assignment period: {cancellationStatus.thresholdHours} hours
          </p>
        </div>
      )}
    </div>
  );
};