'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, ShoppingBag, Menu, X, User } from 'lucide-react';

interface ServiceResult {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const isAuthenticated = !!session;
  const userRole = session?.user?.role; // Assuming NextAuth session has `user.role`

  const [scrolling, setScrolling] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setScrolling(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchServices = async (query: string) => {
    if (!query) return setResults([]);
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchServices(query), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle dashboard redirection based on role
  const handleDashboardRedirect = () => {
    switch (userRole) {
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'PARTNER':
        router.push('/partner/dashboard');
        break;
      case 'USER':
        router.push('/user/dashboard');
        break;
      case 'PENDING_ADMIN':
      default:
        router.push('/');
        break;
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all ${scrolling ? 'backdrop-blur-lg bg-white/50 shadow-md' : 'bg-white'}`}
    >
      <div className="bg-white border-b text-center py-2 text-sm font-medium text-black">
        We are AVAILABLE in Mumbai, Surat
      </div>

      <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <img className="h-8 w-auto" src="/logo.png" alt="Helper Buddy" />
          </Link>
          <span className="text-2xl font-extrabold text-black tracking-wide">Helper Buddy</span>
        </div>

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
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <MapPin className="text-gray-700 hidden md:block" size={24} />
          <ShoppingBag className="text-gray-700 hidden md:block" size={24} />

          {!isAuthenticated && (
            <Link href="/register">
              <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900">
                Register as Partner
              </motion.button>
            </Link>
          )}

          <div className="relative">
            <button
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <User className="text-gray-700" size={24} />
            </button>

            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border"
              >
                <div className="py-2">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/signin">
                        <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Login
                        </button>
                      </Link>
                      <Link href="/signup">
                        <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Sign Up
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={handleDashboardRedirect}
                      >
                        Dashboard
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        onClick={() => signOut()}
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <button className="md:hidden z-50 bg-white p-2 rounded shadow-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} className="text-black" /> : <Menu size={28} className="text-black" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t">
            <div className="px-4 py-3 flex flex-col space-y-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/signin">
                    <button className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md transition-all hover:bg-gray-100">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="w-full px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900">
                      Sign Up
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="w-full px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900">
                      Register as Partner
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={handleDashboardRedirect}>
                    Dashboard
                  </button>
                  <button className="w-full px-4 py-2 text-white bg-red-600 rounded-md transition-all hover:bg-red-700" onClick={() => signOut()}>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
