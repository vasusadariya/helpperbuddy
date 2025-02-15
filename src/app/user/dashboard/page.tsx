// src/user/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, Star, Clock, CheckCircle, Wallet, ArrowUpRight, ArrowDownRight, XCircle } from "lucide-react";
import Link from "next/link";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
};

type OrderStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'SERVICE_COMPLETED'
  | 'PAYMENT_REQUESTED'
  | 'PAYMENT_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLED';

  interface Order {
    id: string;
    service: {
      name: string;
      price: number;
      category: string;
    };
    status: OrderStatus;
    date: string;
    time: string;
    amount: number;
    remainingAmount: number;
    walletAmount: number;
    razorpayPaymentId?: string | null;
    paidAt?: string | null;
    Partner?: {
      name: string;
      email: string;
      phoneno?: string | null;
    } | null;
    review?: {
      rating: number;
    } | null;
  }

interface OrdersResponse {
  success: boolean;
  data: {
    error: string;
    orders: Order[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      limit: number;
    };
  };
}

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

interface WalletResponse {
  success: boolean;
  data: {
    error: string;
    wallet: {
      balance: number;
      transactions: {
        id: string;
        amount: number;
        type: string;
        description: string;
        createdAt: string;
      }[];
    };
  };
}

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
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch orders with proper error handling
        const ordersResponse = await fetch('/api/user/orders?limit=5');
        if (!ordersResponse.ok) {
          const errorData = await ordersResponse.json().catch(() => null);
          throw new Error(
            errorData?.error || 
            `Failed to fetch orders: ${ordersResponse.status} ${ordersResponse.statusText}`
          );
        }
        
        const ordersData: OrdersResponse = await ordersResponse.json();
        if (!ordersData?.success || !ordersData?.data) {
          throw new Error(ordersData?.data?.error || 'Invalid order data received');
        }

        // Fetch wallet data with proper error handling
        const walletResponse = await fetch('/api/wallet');
        if (!walletResponse.ok) {
          const errorData = await walletResponse.json().catch(() => null);
          throw new Error(
            errorData?.error || 
            `Failed to fetch wallet: ${walletResponse.status} ${walletResponse.statusText}`
          );
        }

        const walletData: WalletResponse = await walletResponse.json();
        if (!walletData?.success || !walletData?.data) {
          throw new Error(walletData?.data?.error || 'Invalid wallet data received');
        }

        // Process orders data
        const orders = ordersData.data.orders || [];
        setRecentOrders(orders);

        const completedOrders = orders.filter(
          (order) => order.status === 'COMPLETED'
        );

        const pendingOrders = orders.filter(
          (order) => order.status === 'PENDING'
        );

        const totalRating = completedOrders.reduce(
          (sum, order) => sum + (order.review?.rating || 0),
          0
        );

        setStats({
          totalOrders: ordersData.data.pagination.total,
          completedOrders: completedOrders.length,
          pendingOrders: pendingOrders.length,
          averageRating: completedOrders.length
            ? +(totalRating / completedOrders.length).toFixed(1)
            : 0,
        });

        // Process wallet data
        setWalletData({
          balance: walletData.data.wallet.balance,
          transactions: walletData.data.wallet.transactions || [],
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const getStatusDisplay = (order: Order) => {
    switch (order.status) {
      case 'COMPLETED':
        return {
          text: 'Completed',
          class: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'PAYMENT_COMPLETED':
        return {
          text: 'Payment Completed',
          class: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'SERVICE_COMPLETED':
        return {
          text: 'Service Completed - Payment Pending',
          class: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'PAYMENT_REQUESTED':
        return {
          text: 'Payment Pending',
          class: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'IN_PROGRESS':
        return {
          text: 'In Progress',
          class: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'ACCEPTED':
        return {
          text: 'Accepted',
          class: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'PENDING':
        return {
          text: 'Pending',
          class: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'CANCELLED':
        return {
          text: 'Cancelled',
          class: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />
        };
      default:
        return {
          text: order.status,
          class: 'bg-gray-100 text-gray-800',
          icon: null
        };
    }
  };

  const shouldShowPaymentButton = (order: Order) => {
    return order.status === 'ACCEPTED' && !order.razorpayPaymentId;
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            href="/user/orders"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const statusDisplay = getStatusDisplay(order);
              const isPaymentPending = shouldShowPaymentButton(order);

              return (
                <div
                  key={order.id}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{order.service.name}</p>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          Date: {new Date(order.date).toLocaleDateString()}
                        </p>
                        {order.time && (
                          <p className="text-sm text-gray-600">
                            Time: {order.time}
                          </p>
                        )}
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm text-gray-600">
                            Amount: ₹{order.amount.toFixed(2)}
                          </p>
                          {order.walletAmount > 0 && (
                            <p className="text-sm text-green-600">
                              Wallet Used: ₹{order.walletAmount.toFixed(2)}
                            </p>
                          )}
                          {isPaymentPending && order.remainingAmount > 0 && (
                            <p className="text-sm text-blue-600">
                              Due: ₹{order.remainingAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Partner Details */}
                      {order.Partner && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium">Partner Details</p>
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              Name: {order.Partner.name}
                            </p>
                            {order.Partner.phoneno && (
                              <p className="text-sm text-gray-600">
                                Contact: {order.Partner.phoneno}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${statusDisplay.class}`}
                      >
                        {statusDisplay.icon}
                        <span className="ml-1">{statusDisplay.text}</span>
                      </span>

                      {isPaymentPending && (
                        <Link
                          href={`/payment/${order.id}`}
                          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Payment Status */}
                  {order.razorpayPaymentId && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                      <p>Payment Completed</p>
                      <p className="text-xs">
                        Transaction ID: {order.razorpayPaymentId}
                      </p>
                      {order.paidAt && (
                        <p className="text-xs">
                          Paid on: {new Date(order.paidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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