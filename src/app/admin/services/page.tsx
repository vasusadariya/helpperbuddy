'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PartnerRequestedService {
  id: string;
  name: string;
  description?: string;
  status: string;
  partnerId: string;
}

interface RequestedService {
  id: string;
  name: string;
}

export default function AdminServices() {
  const [partnerRequestedServices, setPartnerRequestedServices] = useState<PartnerRequestedService[]>([]);
  const [requestedServices, setRequestedServices] = useState<RequestedService[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPartnerRequestedServices();
    fetchRequestedServices();
  }, []);

  const fetchPartnerRequestedServices = async () => {
    const res = await fetch('/api/admin/services/partner-requested-services');
    const data = await res.json();
    setPartnerRequestedServices(data);
  };

  const fetchRequestedServices = async () => {
    const res = await fetch('/api/admin/services/requested-services');
    const data = await res.json();
    setRequestedServices(data);
  };

  const handleDecline = async (id: string, type: 'partner' | 'normal') => {
    const url = type === 'partner' ? '/api/admin/services/partner-requested-services/' : '/api/admin/services/requested-services/';
    await fetch(url + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    if (type === 'partner') fetchPartnerRequestedServices();
    else fetchRequestedServices();
  };

  const handleAccept = (service: PartnerRequestedService | RequestedService, type: 'partner' | 'normal') => {
    const queryParams = type === 'partner' ? `?name=${service.name}&description=${(service as PartnerRequestedService).description || ''}&from=partner&id=${service.id}` 
                                            : `?name=${service.name}&from=normal&id=${service.id}`;
    router.push(`/admin/services/add-services${queryParams}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Services</h1>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => router.push('/admin/services/add-services')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Services
        </button>
        <button onClick={() => router.push('/admin/services/delete-services')} className="bg-red-500 text-white px-4 py-2 rounded">
          Delete Services
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side - Partner Requested Services */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Partner Requested Services</h2>
          <ul className="space-y-4">
            {partnerRequestedServices.map((service) => (
              <li key={service.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(service, 'partner')} className="bg-green-500 text-white px-3 py-1 rounded">Accept</button>
                  <button onClick={() => handleDecline(service.id, 'partner')} className="bg-red-500 text-white px-3 py-1 rounded">Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side - Requested Services */}
        <div>
          <h2 className="text-xl font-semibold mb-2">User Requested Services</h2>
          <ul className="space-y-4">
            {requestedServices.map((service) => (
              <li key={service.id} className="p-4 border rounded-lg flex justify-between items-center">
                <h3 className="font-semibold">{service.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(service, 'normal')} className="bg-green-500 text-white px-3 py-1 rounded">Accept</button>
                  <button onClick={() => handleDecline(service.id, 'normal')} className="bg-red-500 text-white px-3 py-1 rounded">Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
