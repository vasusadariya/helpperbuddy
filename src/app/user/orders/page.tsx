"use client";

import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
}

export default function UserOrders() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]); // Always an array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }
  
    fetch("/api/user/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched services from API:", data);
        setServices(data.services || []);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, [session, router]);
  

  const placeOrder = async (serviceId: string) => {
    try {
      const response = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, userId: session?.user?.id }),
      });

      if (response.ok) {
        alert("Order placed successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Something went wrong!");
    }
  };

  if (status === "loading" || loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Available Services</h1>
      {services.length === 0 ? (
        <p>No services available.</p>
      ) : (
        <ul>
          {services.map((service) => (
            <li key={service.id} className="border p-4 mb-2">
              <strong>{service.name}</strong> - ${service.price}
              <button
                onClick={() => placeOrder(service.id)}
                className="ml-4 bg-green-600 text-white px-4 py-2 rounded"
              >
                Order Now
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
