// app/admin/dashboard/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ServiceModal from '@/components/ServiceModal';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  threshold: number;
  isActive: boolean;
  ServiceProvider: Array<{
    Partner: {
      name: string;
      email: string;
    }
  }>;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  threshold: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();
      setServices(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`/api/admin/services/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setServices(services.filter(service => service.id !== id));
        }
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (formData: ServiceFormData) => {
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newService = await response.json();
        setServices([...services, newService]);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleEditSubmit = async (formData: ServiceFormData) => {
    if (!selectedService) return;

    try {
      const response = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedService = await response.json();
        setServices(services.map(service => 
          service.id === selectedService.id ? updatedService : service
        ));
        setIsEditModalOpen(false);
        setSelectedService(null);
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={20} />
          Add New Service
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-gray-600 hover:text-black"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Category:</span> {service.category.replace(/_/g, ' ')}</p>
                <p><span className="font-medium">Price:</span> ₹{service.price}</p>
                <p><span className="font-medium">Threshold Hours:</span> {service.threshold}</p>
                <p className="line-clamp-2"><span className="font-medium">Description:</span> {service.description}</p>
                <div>
                  <p className="font-medium mb-1">Service Providers:</p>
                  <ul className="list-disc list-inside">
                    {service.ServiceProvider.map((sp, index) => (
                      <li key={index} className="text-sm">
                        {sp.Partner.name} ({sp.Partner.email})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <ServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        mode="add"
      />

      {/* Edit Service Modal */}
      {selectedService && (
        <ServiceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedService(null);
          }}
          onSubmit={handleEditSubmit}
          initialData={{
            name: selectedService.name,
            description: selectedService.description,
            price: selectedService.price,
            category: selectedService.category,
            threshold: selectedService.threshold,
          }}
          mode="edit"
        />
      )}
    </div>
  );
}