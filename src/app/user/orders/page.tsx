// app/user/orders/page.tsx
"use client";

import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";

type ExtendedSession = Session & {
  user: {
    role: string;
    id: string;
    name: string;
    email: string;
  };
};

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export default function UserOrders() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated") {
      fetchServices();
    }
  }, [status, router]);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/user/orders");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

 // Update the placeOrder function to use the correct endpoint
const placeOrder = async (serviceId: string) => {
  if (!selectedDate || !selectedTime) {
    alert("Please select both date and time for the service");
    return;
  }

  setIsPlacing(true); // Add this state if you haven't already
  try {
    const response = await fetch("/api/orders/create", { // Updated endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        date: selectedDate,
        time: selectedTime,
        remarks
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Order placed successfully! Order ID: ${data.order.id}`);
      setSelectedDate("");
      setSelectedTime("");
      setRemarks("");
    } else {
      alert(`Failed to place order: ${data.error}`);
    }
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Something went wrong!");
  } finally {
    setIsPlacing(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Services</h1>
      {services.length === 0 ? (
        <p className="text-gray-600">No services available.</p>
      ) : (
        <div className="space-y-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="border rounded-lg p-6 shadow-sm space-y-4"
            >
              <div>
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
                <p className="text-lg font-medium mt-2">
                  ₹{service.price.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Any specific requirements or instructions..."
                />
              </div>

              <button
  onClick={() => placeOrder(service.id)}
  disabled={isPlacing}
  className={`w-full ${
    isPlacing 
      ? 'bg-blue-400 cursor-not-allowed' 
      : 'bg-blue-600 hover:bg-blue-700'
  } text-white px-6 py-3 rounded-lg transition-colors`}
>
  {isPlacing ? 'Placing Order...' : 'Book Service'}
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}