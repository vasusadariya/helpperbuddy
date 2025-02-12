'use client';
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Order = {
  id: string;
  service: {
    name: string;
    price: number;
    category: string;
  };
  Partner: {
    name: string;
    email: string;
    phoneno: string;
  } | null;
  date: string;
  time: string;
  amount: number;
  status: string;
  review: {
    rating: number;
    description: string;
  } | null;
};

type PaginationData = {
  total: number;
  pages: number;
  current: number;
  limit: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/orders?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to load orders. Please try again later.");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          rating,
          description: review,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, review: { rating, description: review } }
          : order
      ));

      setIsReviewModalOpen(false);
      setSelectedOrder(null);
      setRating(0);
      setReview("");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Your Orders</h2>
      
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{order.service.name}</h3>
                  <p className="text-gray-600">
                    Partner: {order.Partner?.name || "Not assigned"}
                  </p>
                  <p className="text-gray-600">
                    Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">Time: {order.time}</p>
                  <p className="text-gray-600">Amount: ₹{order.amount}</p>
                  <p className={`mt-2 font-semibold ${
                    order.status === "COMPLETED" ? "text-green-600" : 
                    order.status === "PENDING" ? "text-yellow-600" : 
                    "text-gray-600"
                  }`}>
                    Status: {order.status}
                  </p>
                </div>

                {order.status === "COMPLETED" && !order.review && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsReviewModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add Review
                  </button>
                )}

                {order.review && (
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < order.review!.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mt-1">{order.review.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchOrders(i + 1)}
              className={`px-3 py-1 rounded transition-colors duration-200 ${
                pagination.current === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Review</h3>
            
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 cursor-pointer ${
                    i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review..."
              className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setSelectedOrder(null);
                  setRating(0);
                  setReview("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!rating || !review.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}