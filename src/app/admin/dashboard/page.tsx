"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

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
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/dashboard?timeframe=${timeframe}`, { signal });
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching dashboard stats:", err);
          setError("Failed to load data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();

    return () => {
      controller.abort(); // Cancel the fetch if the component unmounts or timeframe changes
    };
  }, [timeframe]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <div>No data available</div>;

  const revenueByCategoryData = {
    labels: stats.revenueByCategory.map((item) => item.category),
    datasets: [
      {
        label: "Revenue by Category",
        data: stats.revenueByCategory.map((item) => item.revenue),
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
      },
    ],
  };

  const popularServicesData = {
    labels: stats.popularServices.map((service) => service.name),
    datasets: [
      {
        data: stats.popularServices.map((service) => service.orders),
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
      },
    ],
  };

  const transactionTrendsData = {
    labels: stats.transactionTrends.map((item) => item.type),
    datasets: [
      {
        data: stats.transactionTrends.map((item) => item.amount),
        backgroundColor: ["rgba(75, 192, 192, 0.8)", "rgba(255, 99, 132, 0.8)"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
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
          onChange={(e) => setTimeframe(e.target.value as "day" | "week" | "month")}
          className="border rounded-md px-3 py-2 text-gray-700"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} subtitle="Registered users" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} subtitle="All time earnings" />
        <StatCard title="Average Order Value" value={`₹${stats.averageOrderValue.toLocaleString()}`} subtitle="Per order" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Category">
          <Bar data={revenueByCategoryData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Popular Services">
          <Pie data={popularServicesData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Transaction Trends Chart - Full Width */}
      <ChartCard title="Transaction Trends">
        <Pie data={transactionTrendsData} options={chartOptions} />
      </ChartCard>
    </div>
  );
}

// Reusable Chart Card Component
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="h-64">{children}</div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
