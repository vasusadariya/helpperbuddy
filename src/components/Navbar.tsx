"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { User, LayoutDashboard, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white px-10 py-5 sm:px-14 lg:px-20 text-lg">
      <div className="mx-auto flex max-w-9xl items-center justify-between">
        
        {/* Logo */}
        <div>
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
            Helper Buddy
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-12 ">
          <Link href="/" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link href="/services" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Services
          </Link>
          <Link href="/user/blogs" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Blog
          </Link>
          <Link href="/contact" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Contact
          </Link>
        </div>

        {/* Buttons / User Profile - Preserve space to prevent layout shift */}
        <div className="flex items-center space-x-6 scroll relative min-w-[180px]">
          {status === "loading" ? (
            // Placeholder div with same width to prevent layout shift
            <div className="h-10 w-[180px] bg-gray-300"></div>
          ) : session?.user ? (
            <div className="relative">
              {/* User Icon */}
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
              >
                <User size={28} className="text-gray-900" />
              </button>

              {/* Tooltip Dropdown */}
              {showTooltip && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-lg py-2">
                
                  <Link
                    href="/user/dashboard"
                    className="px-4 py-2 flex justify-center items-center text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard size={15} className="inline-block mr-3" />
                    Dashboard 
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex justify-center w-full items-center text-left py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={15} className="inline-block mr-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded border border-gray-300 bg-white px-5 py-2 text-lg font-medium text-gray-700 hover:border-gray-400 hover:shadow-sm"
              >
                Register as Partner
              </Link>
              <Link
                href="/signin"
                className="rounded bg-gray-900 px-5 py-2 text-lg font-medium text-white hover:bg-gray-700 hover:shadow-md"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
