// app/services/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Category } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services/fetch-services");
      const data = await response.json();
      if (data.success) {
        setServices(data.data.services);
        // Extract unique categories
        const uniqueCategories = ["ALL", ...new Set(data.data.services.map((s: Service) => s.category))] as string[];
        setCategories(uniqueCategories);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory === "ALL" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-6 space-y-4 fixedborder-r">
        <h2 className="text-xl font-bold mb-6">Categories</h2>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`w-full text-left px-4 py-2 rounded ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {category === "ALL" ? "All Services" : formatCategory(category)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">
          {selectedCategory === "ALL" 
            ? "All Services" 
            : formatCategory(selectedCategory)}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">₹{service.price.toFixed(2)}</span>
                <button
                  onClick={() => router.push(`/book-service/${service.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
              <div className="mt-4">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {formatCategory(service.category)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}