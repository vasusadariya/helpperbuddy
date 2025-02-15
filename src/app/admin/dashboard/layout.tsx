'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Users, FileText, Wallet } from 'lucide-react';

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/dashboard/addservices', label: 'Add Service', icon: Plus },
    { href: '/admin/dashboard/manage-partners', label: 'Manage Partners', icon: Users },
    { href: '/admin/dashboard/add-blog', label: 'Add Blog', icon: FileText },
    { href: '/admin/dashboard/wallet', label: 'Wallet & Referral', icon: Wallet },
  ];

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-4 p-3 rounded-lg mb-2 transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Sidebar>{children}</Sidebar>;
}