'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [query, category]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(['all', ...data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category && category !== 'all') params.append('category', category);

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateURL({ query: value, category });
  };

  // Handle category change
  const handleCategoryClick = (selectedCategory: string) => {
    setCategory(selectedCategory);
    updateURL({ query, category: selectedCategory });
  };

  // Update URL parameters dynamically
  const updateURL = ({ query, category }: { query: string; category: string }) => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category && category !== 'all') params.set('category', category);
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex gap-6">
      {/* Sidebar - Categories */}
      <aside className="w-1/4 bg-white p-4 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat}
              className={`cursor-pointer p-2 rounded-md ${
                category === cat ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat === 'all' ? 'All Products' : cat}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content - Services */}
      <div className="w-3/4 bg-white p-6 shadow rounded-lg">
        {/* Search Bar */}
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search services..."
          className="w-full p-3 border border-gray-300 rounded-md mb-4"
        />

        {/* Services List */}
        {services.length > 0 ? (
          <ul className="grid grid-cols-2 gap-6">
            {services.map((service) => (
              <li key={service.id} className="p-4 border rounded-lg">
                <img src={service.image || 'https://via.placeholder.com/150'} alt={service.name} className="w-full h-40 object-cover rounded" />
                <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
                <p className="text-blue-500 font-bold mt-1">${service.price}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No services found.</p>
        )}
      </div>
    </div>
  );
}
