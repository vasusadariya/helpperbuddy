'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, ShoppingBag, Menu, X } from 'lucide-react';

interface ServiceResult {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function Navbar() {
  const [scrolling, setScrolling] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [requested, setRequested] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setScrolling(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchServices = async (query: string) => {
    if (!query) return setResults([]);
    setRequested(false);
    setLoading(true);
    try {
      const res = await fetch('/api/services/home-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query }),
      });
    } catch (error) {
      console.error('Error requesting service:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchServices(query), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all ${scrolling ? 'backdrop-blur-lg bg-white/50 shadow-md' : 'bg-white'
        }`}
    >
      {/* Top Banner */}
      <div className="bg-white border-b text-center py-2 text-sm font-medium text-black">
        We are AVAILABLE in Mumbai, Surat
      </div>

      {/* Main Navbar */}
      <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">

        {/* Logo & Mobile Menu */}
        <div className="flex items-center space-x-2">
          <Link href="/">
            <img className="h-8 w-auto" src="/logo.png" alt="Helper Buddy" />
          </Link>
          <span className="text-2xl font-extrabold text-black tracking-wide">Helper Buddy</span>
        </div>

        {/* Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 justify-center relative">
          <div className="border rounded-md px-3 py-2 w-72 bg-gray-100 flex items-center transition-all hover:shadow-md relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a service..."
              className="bg-transparent flex-1 outline-none text-gray-700"
            />
            <Search className="text-gray-500" size={18} />

            {loading && (
              <div className="absolute right-4">
                <svg className="w-6 h-6 text-yellow-400 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 118 8V12H4z"></path>
                </svg>
              </div>
            )}
          </div>
          {/* Search Results Dropdown */}
          {query && results.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg mt-2 z-50 max-h-60 overflow-y-auto">
              {results.map((service) => (
                <Link href={`/services/${service.id}`} key={service.id}>
                  <div className="p-3 hover:bg-gray-100 flex justify-between items-center cursor-pointer transition-all">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">₹{service.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Icons & Menu */}
        <div className="flex items-center space-x-4">
          <MapPin className="text-gray-700 hidden md:block" size={24} />
          <ShoppingBag className="text-gray-700 hidden md:block" size={24} />

          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-4">
            <Link href="/signin">
              <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md transition-all hover:bg-gray-100">
                Login
              </motion.button>
            </Link>
            <Link href="/signup">
              <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900">
                Sign Up
              </motion.button>
            </Link>
            <Link href="/partner">
              <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900">
                Register as Partner
              </motion.button>
            </Link>
          </div>
          <button className="md:hidden z-50 bg-white p-2 rounded shadow-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} className="text-black" /> : <Menu size={28} className="text-black" />}
          </button>

        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t">
            <div className="px-4 py-3 flex flex-col space-y-4">
              <Link href="/login">
                <button className=" w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md transition-all hover:bg-gray-100">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="w-full px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900">
                  Sign Up
                </button>
              </Link>
              <Link href="/partner">
                <button className="w-full px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900">
                  Register as Partner
                </button>
              </Link>
            </div>
          </div>
        )}``
      </div>
    </motion.nav>
  );
}
