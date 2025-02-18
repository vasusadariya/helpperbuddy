// src/user/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderCancellationStatus } from "@/components/OrderCancellation";
import { PaymentOptions } from "@/components/PaymentOptions";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
};

type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "SERVICE_COMPLETED"
  | "PAYMENT_REQUESTED"
  | "PAYMENT_COMPLETED"
  | "COMPLETED"
  | "CANCELLED";

interface Order {
  id: string;
  service: {
    name: string;
    price: number;
    category: string;
    threshold: number;
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
    profileImage?: string | null;
    isActive?: boolean;
    rating?: number;
  } | null;
  review?: {
    rating: number;
  } | null;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  paymentMode?: "ONLINE" | "COD";
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

interface Transaction {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | "REFERRAL_BONUS" | "SIGNUP_BONUS";
  description: string;
  createdAt: string;
  orderId?: string | null; // Add this to track if transaction is related to an order
  status: "PENDING" | "COMPLETED" | "FAILED"; // Add this to track transaction status
  Order?: {
    id: string;
    status: string;
    service: {
      name: string;
    };
  };
}

interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    timestamp: string;
  };
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

interface WalletResponse {
  success: boolean;
  data: {
    wallet: {
      balance: number;
      transactions: Array<{
        id: string;
        amount: number;
        type: "CREDIT" | "DEBIT" | "REFERRAL_BONUS" | "SIGNUP_BONUS";
        description: string;
        createdAt: string;
        status: "PENDING" | "COMPLETED" | "FAILED";
        orderId?: string | null;
      }>;
    };
    error?: string;
  };
}

export default function UserDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageRating: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
  
        // Fetch orders, wallet data, and transactions in parallel
        const [ordersResponse, walletResponse, transactionsResponse] = await Promise.all([
          fetch("/api/user/orders?limit=5&include=partner"),
          fetch("/api/wallet"),
          fetch("/api/transactions") // Add this new endpoint
        ]);
  
        const ordersData: OrdersResponse = await ordersResponse.json();
        const walletData: WalletResponse = await walletResponse.json();
        const transactionsData: TransactionsResponse = await transactionsResponse.json();
  
        // Handle orders data
        if (ordersResponse.ok && ordersData.success) {
          const orders = ordersData.data.orders || [];
          console.log("Fetched orders with partners:", orders);
  
          setRecentOrders(orders);
  
          const completedOrders = orders.filter(
            (order) =>
              order.status === "COMPLETED"
              // || order.status === "PAYMENT_COMPLETED"
          );
  
          const pendingOrders = orders.filter(
            (order) =>
              order.status === "PENDING" ||
              order.status === "ACCEPTED" ||
              order.status === "IN_PROGRESS"
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
        } else {
          throw new Error(ordersData.data?.error || "Failed to fetch orders");
        }
  
        // Handle wallet data
        if (walletResponse.ok && walletData.success) {
          const wallet = walletData.data.wallet;
          console.log("Fetched wallet data:", wallet);
  
          setWalletData({
            balance: Number(wallet.balance) || 0,
            transactions: [], // We'll use separate transactions state now
          });
        } else {
          throw new Error(walletData.data?.error || "Failed to fetch wallet data");
        }
  
        // Handle transactions data
        if (transactionsResponse.ok && transactionsData.success) {
          const transactions = transactionsData.data.transactions;
          console.log("Fetched transactions:", transactions);
  
          // Set all transactions without filtering
          setTransactions(transactions);
        } else {
          throw new Error(
            "Failed to fetch transactions"
          );
        }
  
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);

  // Add debug logs in the render section
  console.log("Current recentOrders:", recentOrders);
  console.log("Current walletData:", walletData);

  const getStatusDisplay = (order: Order) => {
    switch (order.status) {
      case "COMPLETED":
        return {
          text: "Completed",
          class: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "PAYMENT_COMPLETED":
        return {
          text: "Payment Completed",
          class: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "SERVICE_COMPLETED":
        return {
          text: "Service Completed - Select Payment Method",
          class: "bg-yellow-100 text-yellow-800",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case "PAYMENT_REQUESTED":
        return {
          text: "Payment Pending",
          class: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
        };
      case "IN_PROGRESS":
        return {
          text: "In Progress",
          class: "bg-blue-100 text-blue-800",
          icon: <Clock className="w-4 h-4" />,
        };
      case "ACCEPTED":
        return {
          text: order.razorpayPaymentId
            ? "Payment Completed"
            : "Payment Pending",
          class: order.razorpayPaymentId
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800",
          icon: order.razorpayPaymentId ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          ),
        };
      case "PENDING":
        return {
          text: "Pending",
          class: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
        };
      case "CANCELLED":
        return {
          text: "Cancelled",
          class: "bg-red-100 text-red-800",
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          text: order.status,
          class: "bg-gray-100 text-gray-800",
          icon: null,
        };
    }
  };

  const shouldShowPaymentButton = (order: Order) => {
    // Do not show the payment option if payment has been completed (either wallet-only or via Razorpay)
    if (order.status === "PAYMENT_COMPLETED") return false;
    // If service is completed but no Razorpay payment id exists, and remaining amount is greater than zero, allow payment.
    return (
      ((order.status === "ACCEPTED" && !order.startedAt) ||
        (order.status === "SERVICE_COMPLETED" && !order.razorpayPaymentId) ||
        order.status === "PAYMENT_REQUESTED") &&
      !order.razorpayPaymentId &&
      (order.remainingAmount !== undefined && order.remainingAmount > 0)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{(walletData?.balance || 0).toFixed(2)}
              </p>
            </div>
            <Wallet className="text-blue-500 w-8 h-8" />
          </div>
          <Link
            href="/user/dashboard/wallet"
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center group"
          >
            View Transactions
            <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingOrders}
              </p>
            </div>
            <Clock className="text-yellow-500 w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedOrders}
              </p>
            </div>
            <CheckCircle className="text-green-500 w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Recent Transactions
      </h2>
      <Link
        href="/user/dashboard/wallet"
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
      >
        View All
        <ArrowUpRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : transactions.length > 0 ? (
        transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0"
          >
            <div className="flex items-center">
              <div
                className={`p-2 rounded-full mr-3 ${
                  ["CREDIT", "REFERRAL_BONUS", "SIGNUP_BONUS"].includes(
                    transaction.type
                  )
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {["CREDIT", "REFERRAL_BONUS", "SIGNUP_BONUS"].includes(
                  transaction.type
                ) ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.description}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(transaction.createdAt)}
                </p>
                {transaction.Order && (
                  <p className="text-xs text-gray-500">
                    {transaction.Order.service.name} - Order #{transaction.Order.id}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p
                className={`font-medium ${
                  ["CREDIT", "REFERRAL_BONUS", "SIGNUP_BONUS"].includes(
                    transaction.type
                  )
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {["CREDIT", "REFERRAL_BONUS", "SIGNUP_BONUS"].includes(
                  transaction.type
                )
                  ? "+"
                  : "-"}
                ₹{Math.abs(transaction.amount).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 text-right">
                {transaction.type.split('_').map(word => 
                  word.charAt(0) + word.slice(1).toLowerCase()
                ).join(' ')}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">
          No transactions yet
        </p>
      )}
    </div>
  </div>
</div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/user/orders"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const statusDisplay = getStatusDisplay(order);

              // Add null checks for amounts and format them
              const amount = order?.amount || 0;
              const walletAmount = order?.walletAmount || 0;
              const remainingAmount = order?.remainingAmount || 0;

              return (
                <div
                  key={order.id}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-grow">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.service?.name || "Service Name Not Available"}
                        </p>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-600">
                            Scheduled:{" "}
                            {order.date
                              ? formatDate(order.date)
                              : "Date Not Set"}
                          </p>
                          {order.time && (
                            <p className="text-sm text-gray-600">
                              Time: {order.time}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Amount: ₹{amount.toFixed(2)}
                          </p>
                          {walletAmount > 0 && (
                            <p className="text-sm text-green-600">
                              Wallet Used: ₹{walletAmount.toFixed(2)}
                            </p>
                          )}
                          {remainingAmount > 0 && (
                            <p className="text-sm text-blue-600">
                              Balance Due: ₹{remainingAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {order.status === "PENDING" && (
                        <OrderCancellationStatus
                          order={{
                            id: order.id,
                            status: order.status,
                            createdAt: new Date(order.date || ""),
                            service: {
                              name: order.service?.name || "",
                              threshold: order.service?.threshold || 2,
                            },
                            date: order.date,
                            time: order.time,
                            amount: order.amount || 0,
                            Partner: order.Partner,
                          }}
                        />
                      )}

                      {order.Partner && (
                        <div className="bg-gray-50 rounded-lg p-4 mt-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-blue-100 p-1.5 rounded-full">
                                <UserCheck className="w-4 h-4 text-blue-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                Service Provider Details
                              </p>
                            </div>
                            <div className="flex items-center">
                              {order.Partner.isActive && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active Now
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {order.Partner.profileImage ? (
                                <Image
                                  src={order.Partner.profileImage}
                                  alt={order.Partner.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white shadow-sm">
                                  <span className="text-lg font-semibold text-blue-600">
                                    {order.Partner.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {order.Partner.name}
                                </h4>
                              </div>

                              <div className="mt-2 space-y-1.5">
                                {order.acceptedAt && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3 h-3 mr-1 text-blue-500" />
                                    Accepted: {formatDate(order.acceptedAt)}
                                  </div>
                                )}
                                {order.startedAt && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3 h-3 mr-1 text-blue-500" />
                                    Started: {formatDate(order.startedAt)}
                                  </div>
                                )}
                                {order.completedAt && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                    Completed: {formatDate(order.completedAt)}
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                {order.Partner.phoneno && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    <a
                                      href={`tel:${order.Partner.phoneno}`}
                                      className="hover:text-blue-600 transition-colors"
                                    >
                                      {order.Partner.phoneno}
                                    </a>
                                  </div>
                                )}
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  <a
                                    href={`mailto:${order.Partner.email}`}
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    {order.Partner.email}
                                  </a>
                                </div>
                              </div>

                              <div className="mt-4 flex justify-end space-x-2">
                                {order.Partner.phoneno && (
                                  <button
                                    onClick={() =>
                                      order.Partner &&
                                      (window.location.href = `tel:${order.Partner.phoneno}`)
                                    }
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                  >
                                    <Phone className="w-3 h-3 mr-1.5" />
                                    Call
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    order.Partner &&
                                    (window.location.href = `mailto:${order.Partner.email}`)
                                  }
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                  <Mail className="w-3 h-3 mr-1.5" />
                                  Email
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {order.status === "SERVICE_COMPLETED" && !order.razorpayPaymentId && (
                        <div className="mt-3">
                          <PaymentOptions
                            order={{
                              id: order.id,
                              amount: order.amount,
                              remainingAmount: order.remainingAmount,
                              status: order.status,
                            }}
                            onPaymentComplete={() => {
                              // Refresh the orders list
                              window.location.reload();
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <span className={`px-3 py-1 text-xs rounded-full flex items-center ${statusDisplay.class}`}>
                        {statusDisplay.icon}
                        <span className="ml-1">{statusDisplay.text}</span>
                      </span>

                      {shouldShowPaymentButton(order) && (
                        <Link
                          href={`/payment/${order.id}`}
                          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>

                  {order.razorpayPaymentId && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Payment Completed
                      </p>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-green-700">
                          Transaction ID: {order.razorpayPaymentId}
                        </p>
                        {order.paidAt && (
                          <p className="text-xs text-green-700">
                            Paid on: {formatDate(order.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">No orders found</p>
          )}
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
