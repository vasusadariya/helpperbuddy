"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Wallet,
  XCircle,
  Phone,
  Mail,
  UserCheck,
  Banknote,
  CreditCard,
  Star,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PaymentOptions } from "@/components/PaymentOptions";
import { Review } from "@/components/review";
import { toast } from "react-hot-toast";

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
  Review?: {
    id: string;
    rating: number;
    description?: string;
    createdAt: Date;
  };
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
    orders: Order[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error);
  const fetchOrders = async (page: number) => {
    try {
      const response = await fetch(
        `/api/user/orders?page=${page}&limit=10&include=partner&timestamp=2025-02-19 15:37:31`
      );
      const data: OrdersResponse = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      if (data.success) {
        if (page === 1) {
          setOrders(data.data.orders);
        } else {
          setOrders((prev) => [...prev, ...data.data.orders]);
        }
        setHasMore(data.data.orders.length === 10);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

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

  const getStatusDisplay = (order: Order) => {
    if (order.walletAmount && order.walletAmount === order.amount) {
      return {
        text: "Paid by Wallet",
        class: "bg-green-100 text-green-800",
        icon: <Wallet className="w-4 h-4 text-green-600" />,
      };
    }

    switch (order.status) {
      case "COMPLETED":
        return {
          text: "Completed",
          class: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "PAYMENT_COMPLETED":
        return {
          text: order.paymentMode === "COD" ? "Paid by Cash" : "Payment Completed",
          class: "bg-green-100 text-green-800",
          icon:
            order.paymentMode === "COD" ? (
              <Banknote className="w-4 h-4 text-green-600" />
            ) : (
              <CreditCard className="w-4 h-4 text-green-600" />
            ),
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
          text: order.razorpayPaymentId ? "Payment Completed" : "Payment Pending",
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
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/user/dashboard"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">All Orders</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading && orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <>
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order);
              const amount = order?.amount || 0;
              const walletAmount = order?.walletAmount || 0;
              const remainingAmount = order?.remainingAmount || 0;
              console.log(statusDisplay);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Your existing order card layout */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-grow">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.service?.name ||
                              "Service Name Not Available"}
                          </p>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-600">
                              Scheduled: {order.date}
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


                        {/* Partner (Service Provider) details */}
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

                        {/* Payment if service completed and not yet paid */}
                        {order.status === "SERVICE_COMPLETED" &&
                          !order.razorpayPaymentId && (
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
                      <div className="space-y-3 flex-grow">
                        {/* ... Copy the entire order card content from your recent orders ... */}
                        {/* Include all the sections: order details, partner details, payment info, reviews */}

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

                        {/* Review section */}
                        {order.status === "COMPLETED" && !order.Review && (
                          <div className="mt-3">
                            <Review
                              orderId={order.id}
                              orderStatus={order.status}
                              isPaid={Boolean(
                                order.paidAt || order.razorpayPaymentId
                              )}
                              isServiceCompleted={Boolean(order.completedAt)}
                              hasReview={Boolean(order.Review)}
                              onReviewSubmit={() => {
                                window.location.reload();
                              }}
                            />
                          </div>
                        )}

                        {order.Review && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${(order.Review?.rating ?? 0) >= star
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDate(order.Review.createdAt.toISOString())}
                                </span>
                              </div>
                            </div>
                            {order.Review.description && (
                              <p className="mt-2 text-sm text-gray-600">
                                &quot;{order.Review.description}&quot;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Load More Orders"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}