'use client';

import { useState, useEffect } from 'react';
import { SingleImageDropzone } from '@/components/SingleImageDropzone';
import { useEdgeStore } from '@/lib/edgestore';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    createdAt: string;
}

export default function AdminServiceManager() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const { edgestore } = useEdgeStore();

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async (searchQuery = '') => {
        const res = await fetch('/api/services/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery }),
        });
        const data = await res.json();
        setServices(data);
    };

    const fetchCategories = async () => {
        try {
          const response = await fetch('/api/categories');
          if (!response.ok) throw new Error('Failed to fetch categories');
          const data = await response.json();
          setCategories(data);
        } catch (error) {
          console.error('Error:', error);
        }
      };
    
    const handleCreateService = async () => {
        if (!name || !description || !category || !price || !file) 
            return alert('Please fill all required fields');

        let imageUrl = '';
        if (file) {
            setUploading(true);
            const res = await edgestore.publicFiles.upload({ file });
            imageUrl = res.url;
            setUploading(false);
        }

        const res = await fetch('/api/admin/add-services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price, category, image: imageUrl }),
        });

        if (res.ok) {
            fetchServices();
            setName('');
            setDescription('');
            setPrice(0);
            setCategory('');
            setFile(null);
        } else {
            alert('Failed to create service');
        }
    };

    // Delete Service
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

        const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setServices((prev) => prev.filter((service) => service.id !== id));
        } else {
            alert('Failed to delete service');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Admin - Manage Services</h1>

            {/* Create Service Form */}
            <div className="space-y-4">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Service Name" className="w-full p-2 border rounded" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description" className="w-full p-2 border rounded"></textarea>
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="Price" className="w-full p-2 border rounded" />
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded">
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <SingleImageDropzone 
                    width={200} 
                    height={200} 
                    value={file} 
                    onChange={(file) => setFile(file ?? null)} 
                />

                <button onClick={handleCreateService} disabled={uploading} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                    {uploading ? 'Uploading...' : 'Create Service'}
                </button>
            </div>

            {/* Service List */}
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
