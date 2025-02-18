'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Wallet } from 'lucide-react';

interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    walletBalance?: number;
  };
}

export default function Navbar() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const router = useRouter();

  const isAuthenticated = !!session;
  const userRole = session?.user?.role;
  const userName = session?.user?.name;
  const walletBalance = session?.user?.walletBalance || 0;

  const [scrolling, setScrolling] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [showWalletTooltip, setShowWalletTooltip] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolling(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      default:
        router.push('/');
        break;
    }
    setDropdownOpen(false);
  };

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) => (
    <Link href={href} className="group flex items-center space-x-2">
      {Icon && <Icon className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors duration-300" />}
      <span className="font-light text-gray-700 group-hover:text-black transition-colors duration-300 relative">
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
      </span>
    </Link>
  );

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-30 ${
        scrolling ? 'backdrop-blur-lg bg-white/50 shadow-md' : 'bg-white'
      }`}
    >
      <div className="bg-black text-white border-b text-center py-2 text-sm font-medium">
        We are AVAILABLE in Mumbai, Surat
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 shrink-0">
            <Image className="h-10 w-auto" src="/logo.png" alt="Helper Buddy" width={40} height={40} />
            <span className="text-2xl font-extrabold text-black tracking-wide">Helper Buddy</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavLink href="/services" icon={ShoppingBag}>Services</NavLink>
            <NavLink href="/blogs">Blogs</NavLink>
            <NavLink href="/contactus">Contact Us</NavLink>
            <NavLink href="/about">About Us</NavLink>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <div className="w-full max-w-sm relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a service..."
                className="w-full px-6 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            <button className="hover:scale-110 transition-transform duration-300">
              <MapPin className="w-6 h-6 text-gray-600 hover:text-black transition-colors duration-300" />
            </button>

            {!isAuthenticated && (
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="hidden md:block px-6 py-3 text-white bg-black rounded-lg shadow-lg transition-all hover:bg-black/90 hover:shadow-xl"
                >
                  Register as Partner
                </motion.button>
              </Link>
            )}

            {/* Wallet Icon for User Role */}
            {isAuthenticated && userRole === 'USER' && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setShowWalletTooltip(true)}
                  onMouseLeave={() => setShowWalletTooltip(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <Wallet className="w-5 h-5 text-gray-600" />
                </motion.button>
                <AnimatePresence>
                  {showWalletTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border p-4 min-w-[200px]"
                    >
                      <div className="text-sm font-medium text-gray-600">Wallet Balance</div>
                      <div className="text-2xl font-bold text-black">₹{walletBalance.toFixed(2)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-all flex items-center space-x-3"
              >
                {isAuthenticated ? (
                  <>
                    <div className="hidden lg:block text-right">
                      <p className="text-sm font-medium text-black">{userName}</p>
                      <p className="text-xs text-gray-500">{userRole}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </>
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border overflow-hidden"
                  >
                    {isAuthenticated ? (
                      <div className="p-3 space-y-2">
                        <div className="px-3 py-2 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Signed in as</p>
                          <p className="font-medium text-black">{userName}</p>
                          <p className="text-xs text-gray-500">{userRole}</p>
                        </div>
                        <button
                          onClick={handleDashboardRedirect}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span>Dashboard</span>
                        </button>
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        <Link href="/signin">
                          <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
                            Login
                          </button>
                        </Link>
                        <Link href="/signup">
                          <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
                            Sign Up
                          </button>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden rounded-lg p-2 hover:bg-gray-100 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-white"
          >
            <div className="max-w-7xl mx-auto p-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a service..."
                  className="w-full px-6 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>

              <div className="grid gap-3">
                <Link href="/services" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all">
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 hover:text-black">Services</span>
                </Link>
                <Link href="/blogs" className="p-3 rounded-lg hover:bg-gray-50 transition-all text-gray-600 hover:text-black">
                  Blogs
                </Link>
                <Link href="/contactus" className="p-3 rounded-lg hover:bg-gray-50 transition-all text-gray-600 hover:text-black">
                  Contact Us
                </Link>
                <Link href="/about" className="p-3 rounded-lg hover:bg-gray-50 transition-all text-gray-600 hover:text-black">
                  About Us
                </Link>
              </div>

              {!isAuthenticated ? (
                <div className="grid gap-3 pt-4 border-t">
                  <Link href="/signin">
                    <button className="w-full px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="w-full px-4 py-3 text-white bg-black rounded-lg hover:bg-black/90 transition-all">
                      Sign Up
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="w-full px-4 py-3 text-white bg-black rounded-lg hover:bg-black/90 transition-all">
                      Register as Partner
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 pt-4 border-t">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="font-medium text-black">{userName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                  <button
                    onClick={handleDashboardRedirect}
                    className="w-full px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                  {userRole === 'USER' && (
                    <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-600">Wallet Balance</span>
                      </div>
                      <span className="text-lg font-bold text-black">₹{walletBalance.toFixed(2)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
              {/* Register as Partner Button inside Mobile Menu */}
              <Link href="/register">
                <button
                  className="w-full px-4 py-2 text-white bg-gray-800 rounded-md transition-all hover:bg-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register as Partner
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}