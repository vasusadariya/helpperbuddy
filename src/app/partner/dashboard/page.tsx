// app/partner/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
}

export default function PartnerDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/partner');
        const data = await response.json();
        setServices(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleServiceSelection = (serviceName: string) => {
    setSelectedServices((prev: string[]) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  const handleRequestService = async () => {
    if (!newService) return;
    try {
      await fetch('/api/partner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName: newService })
      });
      alert('Requested service added for admin approval');
    } catch (error) {
      console.error('Error requesting service:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Partner Dashboard</h1>
        <Link 
          href="/partner/orders"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Service Requests
        </Link>
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="grid gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Services</h2>
            <div className="grid gap-3">
              {services.map((service) => (
                <label key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.name)}
                    onChange={() => handleServiceSelection(service.name)}
                    className="rounded border-gray-300"
                  />
                  <span>{service.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Request New Service</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Enter new service"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button 
                onClick={handleRequestService}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Request Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}