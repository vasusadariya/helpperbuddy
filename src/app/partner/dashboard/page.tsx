'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OrderNotification from '@/components/OrderNotification';

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface PartnerService {
  service: Service;
  partnerId: string;
}

export default function PartnerDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [partnerServices, setPartnerServices] = useState<PartnerService[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all available services
        const servicesResponse = await fetch('/api/partner');
        const servicesData = await servicesResponse.json();
        setServices(servicesData);

        // Fetch partner's services
        const partnerServicesResponse = await fetch('/api/partner/services');
        const partnerServicesData = await partnerServicesResponse.json();
        setPartnerServices(partnerServicesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleServiceSelection = (serviceName: string) => {
    setSelectedServices((prev: string[]) =>
      prev.includes(serviceName) 
        ? prev.filter((s) => s !== serviceName) 
        : [...prev, serviceName]
    );
  };

  const handleRequestService = async () => {
    if (!newService.trim()) {
      alert('Please enter a service name');
      return;
    }

    try {
      const response = await fetch('/api/partner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName: newService })
      });

      if (response.ok) {
        alert('Service request submitted for admin approval');
        setNewService('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to request service');
      }
    } catch (error) {
      console.error('Error requesting service:', error);
      alert('Failed to submit service request');
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
      <h1 className="text-3xl font-bold mb-8">Partner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Your Services */}
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

        {/* Column 2: Order Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <OrderNotification />
        </div>

        {/* Column 3: Request New Service */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Request New Service</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Enter service name"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleRequestService}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request
              </button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}