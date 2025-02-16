// app/admin/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularServices: { name: string; orders: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  transactionTrends: { type: string; amount: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeframe]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard?timeframe=${timeframe}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (!stats) return <div>Loading...</div>;

  const revenueByCategoryData = {
    labels: stats.revenueByCategory.map(item => item.category),
    datasets: [{
      label: 'Revenue by Category',
      data: stats.revenueByCategory.map(item => item.revenue),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
    }],
  };

  const popularServicesData = {
    labels: stats.popularServices.map(service => service.name),
    datasets: [{
      data: stats.popularServices.map(service => service.orders),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
    }],
  };

  const transactionTrendsData = {
    labels: stats.transactionTrends.map(item => item.type),
    datasets: [{
      data: stats.transactionTrends.map(item => item.amount),
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 99, 132, 0.8)',
      ],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const pieChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        display: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'day' | 'week' | 'month')}
          className="border rounded-md px-3 py-2 text-gray-700"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="Registered users"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subtitle="All time earnings"
        />
        <StatCard
          title="Average Order Value"
          value={`₹${stats.averageOrderValue.toLocaleString()}`}
          subtitle="Per order"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
          <div className="h-64">
            <Bar 
              data={revenueByCategoryData} 
              options={chartOptions}
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Popular Services</h2>
          <div className="h-64">
            <Pie 
              data={popularServicesData} 
              options={pieChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Transaction Trends Chart - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow md:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Transaction Trends</h2>
          <div className="h-64">
            <Pie 
              data={transactionTrendsData} 
              options={pieChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}