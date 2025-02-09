// app/partner/orders/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;

    };
  }
}

interface Order {
  id: string;
  service: {
    name: string;
  };
  date: string;
  time: string;
  remarks?: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
}

export default function PartnerOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/partner/orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/orders/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          partnerId: session?.user?.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert(`Order ${action}ed successfully`);
      fetchOrders(); // Refresh the orders list

    } catch (err: any) {
      setError(err.message || `Failed to ${action} order`);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Service Requests</h1>
      
      <div className="grid gap-6">
        {orders.length === 0 ? (
          <p className="text-gray-500">No service requests available.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg p-6">
              <div className="grid gap-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg">{order.service.name}</h2>
                    <p className="text-gray-600">
                      {new Date(order.date).toLocaleDateString()} at {order.time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                {order.remarks && (
                  <div>
                    <h3 className="font-medium">Additional Remarks</h3>
                    <p className="text-gray-600">{order.remarks}</p>
                  </div>
                )}
              </div>

              {order.status === 'PENDING' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction(order.id, 'accept')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(order.id, 'reject')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}