"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OrderNotification from "@/components/OrderNotification";

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface Order {
  id: string;
  service: {
    name: string;
    price: number;
  };
  user: {
    name: string;
    email: string;
  };
  date: string;
  time: string;
  status: string;
  amount: number;
  razorpayPaymentId?: string;
  paidAt?: string;
}


interface PartnerService {
  service: Service;
  partnerId: string;
}

export default function PartnerDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [partnerServices, setPartnerServices] = useState<PartnerService[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [newService, setNewService] = useState("");
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");

  const fetchAcceptedOrders = async () => {
    try {
      const response = await fetch("/api/partner/orders");
      const data = await response.json();
      
      if (data.success) {
        setAcceptedOrders(data.data.orders);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
      setError("Failed to fetch accepted orders");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, partnerServicesRes] = await Promise.all([
          fetch("/api/partner"),
          fetch("/api/partner/services")
        ]);

        const [servicesData, partnerServicesData] = await Promise.all([
          servicesRes.json(),
          partnerServicesRes.json()
        ]);

        setServices(servicesData);
        setPartnerServices(partnerServicesData);
        await fetchAcceptedOrders(); // Fetch accepted orders separately

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        setError("Failed to load dashboard data");
      }
    }
    fetchData();

    // Set up polling for accepted orders
    const interval = setInterval(fetchAcceptedOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const getOrderStatusDisplay = (order: Order) => {
    if (order.status === 'ACCEPTED') {
      return order.razorpayPaymentId 
        ? { text: 'Payment Completed', className: 'bg-green-100 text-green-800' }
        : { text: 'Waiting for Payment', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: order.status, className: 'bg-blue-100 text-blue-800' };
  };

  const handleRequestService = async () => {
    if (!newService.trim()) {
      alert("Please enter a service name");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a service description");
      return;
    }

    try {
      const response = await fetch("/api/partner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: newService.trim(),
          description: description.trim(),
        }),
      });

      if (response.ok) {
        alert("Service request submitted for admin approval");
        setNewService("");
        setDescription("");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to request service");
      }
    } catch (error) {
      console.error("Error requesting service:", error);
      alert("Failed to submit service request");
    }
  };

  // const getOrderStatusDisplay = (order: Order) => {
  //   switch (order.status) {
  //     case 'ACCEPTED':
  //       return {
  //         text: order.razorpayPaymentId ? 'Accepted' : 'Waiting for Payment',
  //         className: order.razorpayPaymentId 
  //           ? 'bg-green-100 text-green-800'
  //           : 'bg-yellow-100 text-yellow-800'
  //       };
  //     case 'COMPLETED':
  //       return {
  //         text: 'Completed',
  //         className: 'bg-blue-100 text-blue-800'
  //       };
  //     case 'CANCELLED':
  //       return {
  //         text: 'Cancelled',
  //         className: 'bg-red-100 text-red-800'
  //       };
  //     default:
  //       return {
  //         text: order.status,
  //         className: 'bg-gray-100 text-gray-800'
  //       };
  //   }
  // };

  const formatDateTime = (date: string, time: string) => {
    try {
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Partner Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            href="/partner/profile"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Active Services */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Services</h2>
          <div className="space-y-4">
            {partnerServices.length === 0 ? (
              <p className="text-gray-500">No services added yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {partnerServices.map((ps) => (
                  <li key={ps.service.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{ps.service.name}</h3>
                        <p className="text-sm text-gray-500">
                          ₹{ps.service.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Column 2: New Order Requests */}
        <div className="bg-green-500">
        <OrderNotification />
        </div>

        {/* Accepted Orders Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Accepted Orders</h2>
        <div className="space-y-4">
          {acceptedOrders.length === 0 ? (
            <p className="text-gray-500">No accepted orders</p>
          ) : (
            acceptedOrders.map((order) => {
              const { formattedDate, formattedTime } = formatDateTime(order.date, order.time);
              const status = getOrderStatusDisplay(order);

              return (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{order.service.name}</h3>
                      <p className="text-sm text-gray-600">
                        Customer: {order.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date: {formattedDate}
                      </p>
                      <p className="text-sm text-gray-600">
                        Time: {formattedTime}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">
                        Amount: ₹{order.amount.toFixed(2)}
                      </p>
                      {order.paidAt && (
                        <p className="text-xs text-gray-500">
                          Paid on: {new Date(order.paidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>

      {/* Request New Service Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Request New Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter service name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter service description"
            />
          </div>
        </div>
        <button
          onClick={handleRequestService}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Request Service
        </button>
      </div>
    </div>
  );
}

function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
