'use client';
import { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/service-categories');
        const data: CategoryServices[] = await response.json();
        setServices(data.flatMap(category => category.services));
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Please try again.');
      } finally {
        setIsLoading(false);
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
      setError("Please select at least one service");
      return;
    }

    setIsSubmitting(true);
    setError("");
    
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
        setError(data.error || "Failed to update services");
      }
    } catch (error) {
      console.error("Error updating services:", error);
      setError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      <div className="flex min-h-screen items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-3xl space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl transform transition-all animate-fadeIn">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <h1 className="text-4xl font-bold text-black-600">HelperBuddy</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-600 mb-2">
              Select Your Services
            </h2>
            <p className="text-sm text-gray-500">
              Choose the services you want to provide
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 animate-shake">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black-600 sm:text-sm transition-all duration-200"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="max-h-[400px] overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredServices.map(service => (
                    <label 
                      key={service.id} 
                      className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border ring-1 ring-gray-200 hover:ring-black hover:shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.name)}
                        onChange={() => handleServiceChange(service.name)}
                        className="rounded border-gray-300 h-5 w-5 text-black focus:ring-black transition-colors"
                      />
                      <span className="text-gray-700 font-medium">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-lg bg-black px-3 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Continue to Dashboard"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}