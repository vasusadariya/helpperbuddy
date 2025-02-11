"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import OrderWaitingNotification from '@/components/OrderWaitingNotification';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image?: string;
}

interface BookingDetails {
  date: string;
  time: string;
  remarks?: string;
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // States for services and categories
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for booking process
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [waitingOrderId, setWaitingOrderId] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);
  
  // Booking details state with default values
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    remarks: ''
  });

  const [waitingOrderData, setWaitingOrderData] = useState<{
    orderId: string;
    orderDetails: any;
  } | null>(null);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch services function
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/services/fetch-services");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setServices(data.data.services);
        const uniqueCategories = [
          "ALL",
          ...new Set(data.data.services.map((s: Service) => s.category))
        ] as string[];
        setCategories(uniqueCategories);
      } else {
        throw new Error(data.error || "Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(error instanceof Error ? error.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

    // Handle service booking
    const handleBookService = (service: Service) => {
      if (status === "loading") return;
      
      if (!session) {
        router.push("/signin");
        return;
      }
  
      setSelectedService(service);
      setIsModalOpen(true);
      // Reset booking details to default values
      setBookingDetails({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        remarks: ''
      });
    };

  // Handle service booking
  const handleConfirmBooking = async () => {
    if (!selectedService || !session?.user?.email) return;
  
    try {
      setIsBooking(true);
      setBookingInProgress(selectedService.id);
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: bookingDetails.date,
          time: bookingDetails.time,
          remarks: bookingDetails.remarks || ''
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to book service");
      }
  
      if (data.success) {
        setWaitingOrderData({
          orderId: data.data.orderId,
          orderDetails: {
            totalAmount: data.data.totalAmount,
            walletAmount: data.data.walletAmount,
            remainingAmount: data.data.remainingAmount,
            razorpayOrderId: data.data.razorpayOrderId,
            razorpayAmount: data.data.razorpayAmount,
            serviceDetails: data.data.serviceDetails
          }
        });
        handleCloseModal();
      } else {
        throw new Error(data.error || "Failed to book service");
      }
    } catch (error) {
      console.error("Error booking service:", error);
      setError(error instanceof Error ? error.message : "Failed to book service");
    } finally {
      setIsBooking(false);
      setBookingInProgress(null);
      setSelectedService(null);
    }
  };

  const handleOrderAccepted = () => {
    setWaitingOrderId(null);
    // You might want to show a success message or redirect to orders page
  };

  // Validate date and time
  const validateDateTime = (date: string, time: string): boolean => {
    try {
      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      
      // Ensure date is not in the past
      if (selectedDateTime < now) {
        setError("Please select a future date and time");
        return false;
      }

      // Ensure time is within business hours (8 AM to 8 PM)
      const hour = selectedDateTime.getHours();
      if (hour < 8 || hour >= 20) {
        setError("Please select a time between 8 AM and 8 PM");
        return false;
      }

      setError(null);
      return true;
    } catch (error) {
      setError("Invalid date or time");
      return false;
    }
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!validateDateTime(bookingDetails.date, bookingDetails.time)) {
      return;
    }
    await handleConfirmBooking();
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedService(null);
    setIsModalOpen(false);
    setIsBooking(false);
    setError(null);
  };

  // Filter services by category
  const filteredServices = selectedCategory === "ALL"
    ? services
    : services.filter(service => service.category === selectedCategory);

  // Format category name
  const formatCategory = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error && !isModalOpen) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchServices}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-6 space-y-4 fixed h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Categories</h2>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {category === "ALL" ? "All Services" : formatCategory(category)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-8">
          {selectedCategory === "ALL"
            ? "All Services"
            : formatCategory(selectedCategory)}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {service.image && (
                <div className="mb-4 h-48 overflow-hidden rounded-lg">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">₹{service.price.toFixed(2)}</span>
                <button
                  onClick={() => handleBookService(service)}
                  disabled={bookingInProgress === service.id}
                  className={`${
                    bookingInProgress === service.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-4 py-2 rounded transition-colors`}
                >
                  {bookingInProgress === service.id ? "Booking..." : "Book Now"}
                </button>
              </div>
              <div className="mt-4">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {formatCategory(service.category)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedService && isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Book {selectedService.name}</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={isBooking}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={bookingDetails.date}
                  onChange={(e) => {
                    setError(null);
                    setBookingDetails(prev => ({
                      ...prev,
                      date: e.target.value
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isBooking}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={bookingDetails.time}
                  onChange={(e) => {
                    setError(null);
                    setBookingDetails(prev => ({
                      ...prev,
                      time: e.target.value
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isBooking}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  value={bookingDetails.remarks}
                  onChange={(e) => setBookingDetails(prev => ({
                    ...prev,
                    remarks: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={isBooking}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleBookingSubmit}
                  disabled={isBooking}
                  className={`flex-1 ${
                    isBooking
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-4 py-2 rounded transition-colors`}
                >
                  {isBooking ? "Processing..." : "Confirm Booking"}
                </button>
                <button
                  onClick={handleCloseModal}
                  disabled={isBooking}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*waiting notification */}
      {waitingOrderData && (
  <OrderWaitingNotification 
    orderId={waitingOrderData.orderId}
    initialOrderData={waitingOrderData.orderDetails}
    onOrderAccepted={() => setWaitingOrderData(null)}
    onOrderCancelled={() => setWaitingOrderData(null)}
  />
)}
    </div>
  );
}