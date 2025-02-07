'use client';

import { useState, useEffect } from 'react';

interface ServiceResult {
    id: string;
    name: string;
    price: number;
    description: string;
}

export default function SearchBar() {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<ServiceResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchServices = async (query: string) => {
        if (!query) return setResults([]);

        setLoading(true);
        try {
            const res = await fetch('/api/services/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchServices(query);
        }, 300); // Add debounce effect

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Search Input */}
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full p-3 text-gray-900 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Loading Spinner */}
            {loading && (
                <div className="absolute right-3 top-3">
                    <svg className="w-5 h-5 text-blue-500 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 118 8V12H4z"></path>
                    </svg>
                </div>
            )}

            {/* Results Dropdown */}
            {query && (
                <ul className="absolute left-0 w-full mt-2 bg-white border rounded-lg shadow-lg">
                    {results.length > 0 ? (
                        results.map((service) => (
                            <li key={service.id} className="p-3 border-b last:border-none hover:bg-gray-100 cursor-pointer transition">
                                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                <p className="text-sm text-gray-600">{service.description}</p>
                                <strong className="text-blue-600">₹{service.price}</strong>
                            </li>
                        ))
                    ) : (
                        <li className="p-3 text-center text-gray-500">No results found.</li>
                    )}
                </ul>
            )}
        </div>
    );
}
