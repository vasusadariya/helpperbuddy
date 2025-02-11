'use client';
import { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  category: Category;
}

interface CategoryServices {
  category: Category;
  displayName: string;
  services: Service[];
}

export default function ServiceSelection() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/service-categories');
        const data: CategoryServices[] = await response.json();
        setServices(data.flatMap(category => category.services));
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleServiceChange = (serviceName: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/partner/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: selectedServices }),
      });

      if (response.ok) {
        router.push('/partner/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update services");
      }
    } catch (error) {
      console.error("Error updating services:", error);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl p-8 bg-white border border-gray-200 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Select Your Services</h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border rounded-lg overflow-hidden mb-6">
          <div className="max-h-96 overflow-y-auto p-4 grid grid-cols-2 gap-4">
            {filteredServices.map(service => (
              <label 
                key={service.id} 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border"
              >
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.name)}
                  onChange={() => handleServiceChange(service.name)}
                  className="rounded border-gray-300 h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{service.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:bg-blue-400"
        >
          {isSubmitting ? "Updating..." : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}