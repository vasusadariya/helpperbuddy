// app/admin/dashboard/layout.tsx
'use client'
import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Home, Users, BookOpen, Gift, Wallet, Settings } from 'lucide-react';
import { useState } from 'react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { name: string; href: string; }[];
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Services', href: '/admin/dashboard/services', icon: Settings },
    { 
      name: 'Users', 
      href: '#',
      icon: Users,
      subItems: [
        { name: 'Service Providers', href: '/admin/dashboard/users/providers' },
        { name: 'Customers', href: '/admin/dashboard/users/customers' }
      ]
    },
    { name: 'Blogs', href: '/admin/dashboard/blogs', icon: BookOpen },
    { name: 'Referrals', href: '/admin/dashboard/referrals', icon: Gift },
    { name: 'Wallet', href: '/admin/dashboard/wallet', icon: Wallet },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <div key={item.name}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
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
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}