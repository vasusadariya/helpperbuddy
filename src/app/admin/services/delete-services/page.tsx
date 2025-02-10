'use client';

import { useState, useEffect } from 'react';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    createdAt: string;
}

export default function DeleteServices() {
    const [services, setServices] = useState<Service[]>([]);
    
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async (searchQuery = '') => {
        const res = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery }),
        });
        const data = await res.json();
        setServices(data);
    };

    const handleDeleteService = async (id: string, image: string | undefined) => {
        if (!confirm('Are you sure?')) return;

        if (image) {
            await fetch('/api/edgestore/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: image }),
            });
            console.log('Image deleted successfully');
        }

        const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setServices((prev) => prev.filter((service) => service.id !== id));
        } else {
            alert('Failed to delete service');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mt-6 mb-2">Existing Services</h2>
            <ul className="space-y-4">
                {services.map((service) => (
                    <li key={service.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-gray-600 text-sm">{service.category} - ${service.price}</p>
                        </div>
                        <button onClick={() => handleDeleteService(service.id, service.image)}
                            className="bg-red-500 text-white px-3 py-1 rounded">
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
