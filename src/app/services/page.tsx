'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import type { Category } from "@prisma/client"
import { format } from "date-fns"

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface BookingDetails {
  date: string
  time: string
  remarks?: string
  phoneNumber: string
  address: string
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session, status } = useSession()

  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null)

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    remarks: "",
    phoneNumber: "",
    address: "",
  })

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [query, category]);

  // useEffect(() => {
  //   if (session?.user?.email) {
  //     fetchUserDetails(session.user.email)
  //   }
  // }, [session])

  // const fetchUserDetails = async (email: string) => {
  //   try {
  //     const response = await fetch(`/api/users/${email}`)
  //     const data = await response.json()
  //     if (data.success) {
  //       setBookingDetails((prev) => ({
  //         ...prev,
  //         phoneNumber: data.user.phoneno || "",
  //       }))
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user details:", error)
  //   }
  // }

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(['all', ...data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: Service) => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
      return;
    }

    setSelectedService(service);
    setIsModalOpen(true);
    setBookingDetails(prev => ({
      ...prev,
      date: format(new Date(), "yyyy-MM-dd"),
      time: "10:00",
      remarks: "",
    }));
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !session?.user?.email) return

    try {
      setIsBooking(true)
      setBookingInProgress(selectedService.id)

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: bookingDetails.date,
          time: bookingDetails.time,
          remarks: bookingDetails.remarks || "",
          phoneNumber: bookingDetails.phoneNumber,
          address: bookingDetails.address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to book service")
      }

      if (data.success) {
        router.push(`/orders/${data.data.orderId}/payment`)
      } else {
        throw new Error(data.error || "Failed to book service")
      }
    } catch (error) {
      console.error("Error booking service:", error)
      setError(error instanceof Error ? error.message : "Failed to book service")
    } finally {
      setIsBooking(false)
      setBookingInProgress(null)
      setSelectedService(null)
    }
  }

  const validateDateTime = (date: string, time: string): boolean => {
    try {
      const selectedDateTime = new Date(`${date}T${time}`)
      const now = new Date()

      if (selectedDateTime < now) {
        setError("Please select a future date and time")
        return false
      }

      const hour = selectedDateTime.getHours()
      if (hour < 8 || hour >= 20) {
        setError("Please select a time between 8 AM and 8 PM")
        return false
      }

      setError(null)
      return true
    } catch (error) {
      setError("Invalid date or time")
      return false
    }
  }

  const handleBookingSubmit = async () => {
    if (!validateDateTime(bookingDetails.date, bookingDetails.time)) {
      return
    }
    await handleConfirmBooking()
  }

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category && category !== 'all') params.append('category', category);

      const res = await fetch(`/api/services?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateURL({ query: value, category });
  };

  const handleCategoryClick = (selectedCategory: string) => {
    setCategory(selectedCategory);
    updateURL({ query, category: selectedCategory });
  };

  const updateURL = ({ query, category }: { query: string; category: string }) => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category && category !== 'all') params.set('category', category);
    router.push(`/services?${params.toString()}`);
  };

  const handleCloseModal = () => {
    setSelectedService(null)
    setIsModalOpen(false)
    setIsBooking(false)
    setError(null)
  }

  const filteredServices =
    selectedCategory === "ALL" ? services : services.filter((service) => service.category === selectedCategory)

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  //     </div>
  //   )
  // }

  return (
    <div className="max-w-6xl mx-auto p-6 flex gap-6">
      {/* Sidebar - Categories */}
      <aside className="w-1/4 bg-white p-4 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat}
              className={`cursor-pointer p-2 rounded-md ${
                category === cat ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat === 'all' ? 'All Products' : cat}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content - Services */}
      <div className="w-3/4 bg-white p-6 shadow rounded-lg">
        {/* Search Bar */}
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search services..."
          className="w-full p-3 border border-gray-300 rounded-md mb-4"
        />

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : services.length > 0 ? (
          <ul className="grid grid-cols-2 gap-6">
            {services.map((service) => (
              <li key={service.id} className="p-4 border rounded-lg">
                <img 
                  src={service.image || 'https://via.placeholder.com/150'} 
                  alt={service.name} 
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
                <p className="text-blue-500 font-bold mt-1">₹{service.price}</p>
                <button
                  onClick={() => handleBookService(service)}
                  disabled={bookingInProgress === service.id}
                  className={`mt-2 w-full ${
                    bookingInProgress === service.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-4 py-2 rounded transition-colors`}
                >
                  {bookingInProgress === service.id ? "Booking..." : "Book Now"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No services found.</p>
        )}



        {/* Booking Modal */}
      {selectedService && isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Book {selectedService.name}</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700" disabled={isBooking}>
                ×
              </button>
            </div>

            {error && <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  value={bookingDetails.date}
                  onChange={(e) => {
                    setError(null)
                    setBookingDetails((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isBooking}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={bookingDetails.time}
                  onChange={(e) => {
                    setError(null)
                    setBookingDetails((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isBooking}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={bookingDetails.phoneNumber}
                  onChange={(e) =>
                    setBookingDetails((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isBooking}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={bookingDetails.address}
                  onChange={(e) =>
                    setBookingDetails((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={isBooking}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <textarea
                  value={bookingDetails.remarks}
                  onChange={(e) =>
                    setBookingDetails((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
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
                    isBooking ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
      </div>
    </div>
  );
}
