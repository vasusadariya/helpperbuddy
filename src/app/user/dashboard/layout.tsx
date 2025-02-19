"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, FileText, ArrowUpRight, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import { signOut } from "next-auth/react";

const handleLogout = async () => {
  await signOut({ callbackUrl: '/' });
};


const sidebarItems = [
  { name: "Profile", href: "/user/dashboard/profile", icon: User },
  { name: "Orders", href: "/user/dashboard/orders", icon: FileText },
  { name: "Transactions", href: "/user/dashboard/transactions", icon: ArrowUpRight },
  { name: "Logout", onclick: { handleLogout }, href: "/user/dashboard/transactions", icon:  LogOut},
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
      className={`fixed inset-y-0 top-8 left-0 transform ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-black shadow-lg mt-16`}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <nav className="mt-8 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  pathname === item.href ? "bg-white text-black" : "text-white hover:bg-white hover:text-black"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>

      {/* Main content */}
      <div className="md:ml-64 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}