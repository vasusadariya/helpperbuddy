"use client";
import React from 'react';
import { 
  Users, 
  Package, 
  Calendar, 
  User, 
  FileText, 
  Table, 
  File, 
  PieChart, 
  Layout,
  Search,
  Moon,
  Bell,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';
import TargetCard from '@/components/Targetcard';

// Types
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  hasSubmenu?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Components
const NavItem: React.FC<NavItemProps> = ({ icon, label, hasSubmenu = false }) => (
  <button className="w-full flex items-center justify-between p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
    {hasSubmenu && <ChevronDown size={16} />}
  </button>
);

const Sidebar: React.FC = () => (
  <div className="w-64 h-screen bg-white border-r">
    <div className="flex items-center p-4 gap-2">
      <div className="w-8 h-8 rounded-lg">
      <Link href="/">
            <img className="h-8 w-auto" src="/logo.png" alt="Helper Buddy" />
          </Link>
      </div>
      <h1 className="text-xl font-semibold">Helper Buddy</h1>
    </div>
    
    <div className="px-4 py-2">
      <p className="text-sm text-gray-500">MENU</p>
      <div className="mt-2 space-y-1">
        <button className="w-full flex items-center gap-2 p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Layout size={20} />
          <span>Dashboard</span>
        </button>
        <button className="w-full flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Package size={20} />
          <span>Ecommerce</span>
        </button>
      </div>
    </div>
    
    <div className="px-4 py-2 space-y-1">
      <NavItem icon={<Calendar size={20} />} label="Calendar" />
      <NavItem icon={<User size={20} />} label="User Profile" />
      <NavItem icon={<FileText size={20} />} label="Forms" hasSubmenu />
      <NavItem icon={<Table size={20} />} label="Tables" hasSubmenu />
      <NavItem icon={<File size={20} />} label="Pages" hasSubmenu />
    </div>
    
    <div className="px-4 py-2">
      <p className="text-sm text-gray-500">OTHERS</p>
      <div className="mt-2 space-y-1">
        <NavItem icon={<PieChart size={20} />} label="Charts" hasSubmenu />
        <NavItem icon={<Layout size={20} />} label="UI Elements" hasSubmenu />
      </div>
    </div>
  </div>
);

const Header: React.FC = () => (
  <div className="flex items-center justify-between p-4 border-b">
    <button className="p-2 hover:bg-gray-100 rounded-lg">
      <Layout size={20} />
    </button>
    
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg flex-1 mx-4">
      <Search size={20} />
      <input
        type="text"
        placeholder="Search or type command..."
        className="bg-transparent outline-none flex-1"
      />
      <kbd className="px-2 py-1 bg-white rounded-md text-sm">⌘K</kbd>
    </div>
    
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-gray-100 rounded-lg">
        <Moon size={20} />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded-lg relative">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      <div className="flex items-center gap-2">
        <img
          src="/api/placeholder/32/32"
          alt="User"
          className="w-8 h-8 rounded-full"
        />
        <span>Musharof</span>
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change }) => (
  <div className="p-6 bg-white rounded-2xl">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-gray-100 rounded-lg">
        {icon}
      </div>
      <button>
        <MoreVertical size={20} className="text-gray-400" />
      </button>
    </div>
    <div className="mt-4">
      <h3 className="text-lg text-gray-600">{title}</h3>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold">{value}</span>
        <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>
    </div>
  </div>
);

const   CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
        <p className="text-sm font-medium">{`sales: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const MonthlyChart: React.FC = () => {
  const data = [
    { month: 'Jan', sales: 120 },
    { month: 'Feb', sales: 350 },
    { month: 'Mar', sales: 180 },
    { month: 'Apr', sales: 280 },
    { month: 'May', sales: 180 },
    { month: 'Jun', sales: 180 },
    { month: 'Jul', sales: 260 },
    { month: 'Aug', sales: 100 },
    { month: 'Sep', sales: 200 },
    { month: 'Oct', sales: 350 },
    { month: 'Nov', sales: 250 },
    { month: 'Dec', sales: 100 }
  ];

  return (
    <div className="p-6 bg-white rounded-2xl h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Sales</h3>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 15 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
            <Bar 
              dataKey="sales" 
              fill="#4F46E5"
              radius={[20, 20, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-3 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-8 mb-6 ml-auto">
            <StatCard
              icon={<Users size={24} />}
              title="Customers"
              value="3,782"
              change={11.01}
            />
            <StatCard
              icon={<Package size={24} />}
              title="Orders"
              value="5,359"
              change={-9.05}
            />
            <div>
            <TargetCard />
            </div>
            
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <MonthlyChart />
            </div>
         
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;