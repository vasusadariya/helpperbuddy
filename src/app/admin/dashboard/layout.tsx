'use client'
import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Home, Users, BookOpen, Gift, Wallet, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { name: string; href: string; }[];
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Services', href: '/admin/dashboard/services', icon: Settings },
    { 
      name: 'Users', 
      href: '#',
      icon: Users,
      subItems: [
        { name: 'Service Providers', href: '/admin/dashboard/users/providers' },
        { name: 'Customers', href: '/admin/dashboard/users/customers' },
        { name: 'Admin', href: '/admin/dashboard/users/pending-admin' }
      ]
    },
    { name: 'Blogs', href: '/admin/dashboard/blogs', icon: BookOpen },
    { name: 'Wallet & Referrals', href: '/admin/dashboard/wallet', icon: Wallet },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      </div>
      <nav className="flex-1 mt-4 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  <span>{item.name}</span>
                  <ChevronDown className={`ml-auto w-4 h-4 transform transition-transform ${
                    expandedItem === item.name ? 'rotate-180' : ''
                  }`} />
                </button>
                {expandedItem === item.name && (
                  <div className="pl-8 bg-gray-50">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-2" />
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
        
        {/* Logout Button - Now part of the navigation list */}
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}