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
    const [requested, setRequested] = useState<boolean>(false);

    const fetchServices = async (query: string) => {
        if (!query) return setResults([]);
        setRequested(false);
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

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchServices(query);
        }, 300); // Add debounce effect

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative w-full max-w-xl mx-auto mt-6">
            {/* Search Input */}
            <div className="relative flex items-center w-full">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a service..."
                    className="w-full p-4 pl-12 text-gray-900 bg-white border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <svg className="absolute left-4 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                {loading && (
                    <div className="absolute right-4">
                        <svg className="w-6 h-6 text-yellow-400 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 118 8V12H4z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {/* Results Dropdown */}
            {query && (
                <ul className="absolute left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.length > 0 ? (
                        results.map((service) => (
                            <li key={service.id} className="p-4 border-b last:border-none hover:bg-yellow-50 cursor-pointer transition">
                                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{service.description}</p>
                                <strong className="text-yellow-600">₹{service.price}</strong>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-gray-500">
                            No results found.
                            <button
                                onClick={requestService}
                                className={`block w-full mt-2 ${
                                    requested ? "bg-green-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                } text-white p-2 rounded-lg transition`}
                                disabled={requested || query.length < 3 || query.length > 50}
                            >
                                {requested ? "Requested" : "Request Service"}
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
