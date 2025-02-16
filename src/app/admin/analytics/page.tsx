"use client";

import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

Chart.register(...registerables);

export default function AdminAnalytics() {
  const [salesData, setSalesData] = useState<{ date: string; totalRevenue: number }[]>([]);
  const [trafficData, setTrafficData] = useState<{ date: string; visits: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const salesRes = await fetch("/api/admin/analytics/sales");
        const trafficRes = await fetch("/api/admin/analytics/traffic");

        if (!salesRes.ok || !trafficRes.ok) throw new Error("Failed to fetch analytics");

        const salesJson = await salesRes.json();
        const trafficJson = await trafficRes.json();

        setSalesData(salesJson);
        setTrafficData(trafficJson);
      } catch (err) {
        setError("Error loading analytics data.");
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const salesChartData = {
    labels: salesData.map((data) => data.date),
    datasets: [
      {
        label: "Total Sales (₹)",
        data: salesData.map((data) => data.totalRevenue),
        borderColor: "#f97316", // Orange for a modern look
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        fill: true,
        tension: 0.4, // Smooth line
      },
    ],
  };

  // 📊 Pie Chart Data (Traffic Breakdown)
  const pieChartData = {
    labels: trafficData.map((data) => data.date),
    datasets: [
      {
        label: "Website Traffic",
        data: trafficData.map((data) => data.visits),
        backgroundColor: ["#22c55e", "#f97316", "#3b82f6", "#eab308", "#ec4899"], // Beautiful colors
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-gray-200">
        Admin Analytics 📊
      </h1>

      {loading && <p className="text-center">Loading analytics data...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Sales Trend (Stock Market Style Line Chart) */}
          <Card className="p-8">
            <CardHeader title="📈 Sales Report (Stock Market Style)" />
            <CardContent>
              <Line
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      suggestedMax: Math.max(...salesData.map((d) => d.totalRevenue), 1000),
                      grid: { color: "rgba(200, 200, 200, 0.3)" },
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Website Traffic (Pie Chart) */}
          <Card className="p-8">
            <CardHeader title="🌍 Website Traffic Breakdown" />
            <CardContent>
              <Pie data={pieChartData} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}