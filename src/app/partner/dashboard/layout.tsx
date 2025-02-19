"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  MapPin,
  Menu,
  X,
  LogOut
} from "lucide-react";

export default function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { name: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/partner/dashboard/schedule", icon: Calendar },
    { name: "Request New service", href: "/partner/dashboard/request-new-service", icon: MapPin },
    { name: "Profile", href: "/partner/dashboard/profile", icon: User }
  ];

  const isActiveLink = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b px-4 py-3 z-20">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:inset-0 z-30 w-64 bg-white border-r transition duration-200 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold">Partner Dashboard</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActiveLink(item.href)
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile header spacer */}
          <div className="h-14 lg:h-0"></div>
          
          {/* Content area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}