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
  isActive: boolean;
}

interface PartnerData {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    approved: boolean;
    isActive: boolean;
    lastActive: string;
  };
  services: Service[];
  serviceAreas: {
    id: string;
    pincode: string;
    addedAt: string;
  }[];
  meta: {
    totalServices: number;
    totalServiceAreas: number;
    pendingRequests: number;
    timestamp: string;
  };
}

interface Order {
  id: string;
  service: {
    name: string;
    category: string;
  };
  user: {
    name: string;
    email: string;
    phoneno?: string;
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
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [newService, setNewService] = useState("");
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);  // Track errors


  const fetchPartnerData = async () => {
    try {
      const response = await fetch("/api/partner");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setPartnerData(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch partner data");
      }
    } catch (err) {
      console.error("Error fetching partner data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch partner data");
    }
  };


  const fetchAcceptedOrders = async () => {
    try {
      const response = await fetch("/api/partner/orders");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setAcceptedOrders(data.data.orders);
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching accepted orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPartnerData(),
          fetchAcceptedOrders()
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchAcceptedOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const getOrderStatusDisplay = (order: Order) => {
    if (order.status === "ACCEPTED") {
      return order.razorpayPaymentId 
        ? { text: "Payment Completed", className: "bg-green-100 text-green-800" }
        : { text: "Waiting for Payment", className: "bg-yellow-100 text-yellow-800" };
    }
    return { text: order.status, className: "bg-blue-100 text-blue-800" };
  };

  const handleRequestService = async () => {
    if (!newService.trim()) {
      setError("Please enter a service name");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a service description");
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

      const data = await response.json();

      if (data.success) {
        setNewService("");
        setDescription("");
        setError(null);
        await fetchPartnerData(); // Refresh partner data
      } else {
        throw new Error(data.error || "Failed to request service");
      }
    } catch (err) {
      console.error("Error requesting service:", err);
      setError(err instanceof Error ? err.message : "Failed to submit service request");
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
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const [hours, minutes] = time.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      const formattedTime = timeDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return { formattedDate, formattedTime };
    } catch (err) {
      console.error("Error formatting date/time:", err);
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

  if (!partnerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Failed to load partner data</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

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
            {partnerData.services.length === 0 ? (
              <p className="text-gray-500">No services added yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {partnerData.services.map((service) => (
                  <li key={service.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-500">
                          ₹{service.price.toFixed(2)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
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
