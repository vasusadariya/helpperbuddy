"use client"; // Required for Client Components

import Link from "next/link";
import React from "react";

export default function UserDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
        <p className="mt-4 text-gray-600">
          Welcome to your dashboard! Here you can manage your profile, view your orders, and more.
        </p>

        {/* Example of dashboard options */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            View Profile
          </button>
          <Link href='./orders' className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
