'use client';
import { useState, useEffect } from 'react';

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

interface Service {
    id: string;
    name: string;
}

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
    <div>
      <h1>Partner Dashboard</h1>

      {loading ? <p>Loading services...</p> : (
        <>
          <h2>Select Services You Provide:</h2>
          <ul>
            {services.map((service) => (
              <li key={service.id}>
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.name)}
                  onChange={() => handleServiceSelection(service.name)}
                />
                {service.name}
              </li>
            ))}
          </ul>

          <h2>Request a New Service:</h2>
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Enter new service"
          />
          <button onClick={handleRequestService}>Request Service</button>
        </>
      )}
    </div>
  );
}
