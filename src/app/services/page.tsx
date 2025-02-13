'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  numberoforders: number;
  image?: string;
}

// Debounce helper function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requested, setRequested] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounced fetch services
  const debouncedFetchServices = useCallback(
    debounce(async (searchQuery: string, searchCategory: string) => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (searchCategory && searchCategory !== 'all') params.append('category', searchCategory);

        const res = await fetch(`/api/services?${params.toString()}`);
        const data = await res.json();
        setServices(data);
        setIsSearching(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setIsSearching(false);
      }
    }, 500), // 500ms delay
    []
  );

  // Update services when query or category changes
  useEffect(() => {
    setIsSearching(true);
    debouncedFetchServices(query, category);
  }, [query, category, debouncedFetchServices]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(['all', ...data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Debounced URL update
  const debouncedUpdateURL = useCallback(
    debounce(({ query, category }: { query: string; category: string }) => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (category && category !== 'all') params.set('category', category);
      router.push(`/services?${params.toString()}`);
    }, 500),
    [router]
  );

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedUpdateURL({ query: value, category });
  };

  // Handle category change
  const handleCategoryClick = (selectedCategory: string) => {
    setCategory(selectedCategory);
    debouncedUpdateURL({ query, category: selectedCategory });
  };

  const requestService = async () => {
    if (query.length < 3 || query.length > 50) return;
    setRequested(true);

    try {
        await fetch('/api/services/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: query }),
        });
    } catch (error) {
        console.error('Error requesting service:', error);
    }
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
              className={`cursor-pointer p-2 rounded-md ${category === cat ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
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
        {/* Search Bar with Loading State */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search services..."
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Services List */}
        {services.length > 0 ? (
          <ul className="grid grid-cols-2 gap-6">
            {services.map((service) => (
              <li key={service.id} className="p-4 border rounded-lg">
                <img
                  src={service.image || 'https://via.placeholder.com/150'}
                  alt={service.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
                <p className="text-blue-500 font-bold mt-1">${service.price}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No results found.
            <button
              onClick={requestService}
              className={`block w-full mt-2 ${requested ? "bg-green-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                } text-white p-2 rounded-lg transition`}
              disabled={requested || query.length < 3 || query.length > 50}
            >
              {requested ? "Requested" : "Request Service"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}