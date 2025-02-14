// src/user/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, Star, Clock, CheckCircle, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
};

type WalletData = {
  balance: number;
  transactions: {
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }[];
};

export default function UserDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageRating: 0,
  });
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    transactions: [],
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await fetch('/api/user/orders?limit=5');
        const ordersData = await ordersResponse.json();

        // Fetch wallet data
        const walletResponse = await fetch('/api/wallet');
        const walletData = await walletResponse.json();

        if (ordersResponse.ok) {
          setRecentOrders(ordersData.orders);
          
          const completedOrders = ordersData.orders.filter(
            (order: any) => order.status === 'COMPLETED'
          );
          
          const pendingOrders = ordersData.orders.filter(
            (order: any) => order.status === 'PENDING'
          );
          
          const totalRating = completedOrders.reduce(
            (sum: number, order: any) => sum + (order.review?.rating || 0),
            0
          );
          
          setStats({
            totalOrders: ordersData.pagination.total,
            completedOrders: completedOrders.length,
            pendingOrders: pendingOrders.length,
            averageRating: completedOrders.length 
              ? +(totalRating / completedOrders.length).toFixed(1)
              : 0,
          });
        }

        if (walletResponse.ok && walletData.data) {
          setWalletData({
            balance: walletData.data.wallet.balance,
            transactions: walletData.data.wallet.transactions,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-3xl font-bold">₹{walletData.balance.toFixed(2)}</p>
            </div>
            <Wallet className="text-blue-500 w-8 h-8" />
          </div>
          <Link 
            href="/user/dashboard/wallet"
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View Transactions
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
            <Clock className="text-yellow-500 w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold">{stats.completedOrders}</p>
            </div>
            <CheckCircle className="text-green-500 w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {walletData.transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      transaction.type === 'CREDIT' || transaction.type === 'REFERRAL_BONUS'
                        ?'bg-red-100'
                        :'bg-green-100'
                    }`}>
                      {transaction.type === 'CREDIT' || transaction.type === 'REFERRAL_BONUS' ? (
                        <ArrowUpRight className="w-4 h-4 text-red-600"/>
                      ) : (
                        <ArrowDownRight className="w-4 h-4  text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-medium ${
                    transaction.type === 'CREDIT' || transaction.type === 'REFERRAL_BONUS'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    {transaction.type === 'CREDIT' || transaction.type === 'REFERRAL_BONUS' ? '-' : '+'}
                    ₹{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border-b last:border-b-0 pb-4 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{order.service.name}</p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(order.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount: ₹{order.amount}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No orders found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}