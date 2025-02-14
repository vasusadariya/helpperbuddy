'use client'

import React from 'react';
import { signOut } from "next-auth/react";
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Bell,
  Search,
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  User,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white border-r border-gray-200`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">TailAdmin</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50 text-blue-600">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
            <Users className="h-5 w-5" />
            <span>Users</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
            <ShoppingCart className="h-5 w-5" />
            <span>Products</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                <Menu className="h-6 w-6" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2"
                >
                  <img
                    src="/api/placeholder/32/32"
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                  <span>John Doe</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
                    <a href="#" className="flex items-center space-x-2 p-3 hover:bg-gray-100">
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </a>
                    <a href="#" className="flex items-center space-x-2 p-3 hover:bg-gray-100">
                      <Mail className="h-5 w-5" />
                      <span>Messages</span>
                    </a>
                    <a onClick={() => signOut()} className="flex items-center space-x-2 p-3 hover:bg-gray-100 text-red-600">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="rounded-full p-3 bg-blue-100">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold">$54,234</h3>
                  <p className="text-sm text-green-500">+2.5% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="rounded-full p-3 bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold">2,543</h3>
                  <p className="text-sm text-green-500">+12.5% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="rounded-full p-3 bg-purple-100">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold">1,234</h3>
                  <p className="text-sm text-red-500">-1.5% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="rounded-full p-3 bg-yellow-100">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <h3 className="text-2xl font-bold">3.24%</h3>
                  <p className="text-sm text-green-500">+0.8% from last month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              {/* <CardContent>
                <div className="h-[300px]">
                  <LineChart width={500} height={300} data={revenueData}>
                    <XAxis dataKey="name" />
                    <LineChart.Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </div>
              </CardContent> */}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">New user registered</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Order ID</th>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <tr key={item} className="border-b hover:bg-gray-50">
                        <td className="p-4">#ORD-{item}234</td>
                        <td className="p-4">Customer {item}</td>
                        <td className="p-4">Product {item}</td>
                        <td className="p-4">${(Math.random() * 1000).toFixed(2)}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;