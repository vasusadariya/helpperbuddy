"use client";

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";
import CheckoutModal from "@/components/CheckoutModal";
import { validateDateTime, validateDateTimeForServices } from "@/lib/utils/validation";
import Image from "next/image";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  threshold: number;
  numberoforders: number;
  category: string;
  image?: string;
}

interface CartItem extends Service {
  quantity: number;
}

enum Category {
  AC_SERVICE = "AC_SERVICE",
  BATHROOM_KITCHEN_CLEANING = "BATHROOM_KITCHEN_CLEANING",
  CARPENTER = "CARPENTER",
  CHIMNEY_REPAIR = "CHIMNEY_REPAIR",
  ELECTRICIAN = "ELECTRICIAN",
  MICROWAVE_REPAIR = "MICROWAVE_REPAIR",
  PLUMBERS = "PLUMBERS",
  REFRIGERATOR_REPAIR = "REFRIGERATOR_REPAIR",
  SOFA_CARPET_CLEANING = "SOFA_CARPET_CLEANING",
  WASHING_MACHINE_REPAIR = "WASHING_MACHINE_REPAIR",
  WATER_PURIFIER_REPAIR = "WATER_PURIFIER_REPAIR",
}

// interface CheckoutModalProps {
//   isOpen: boolean;
//   isProcessing: boolean;
//   bookingDetails: BookingDetails;
//   onClose: () => void;
//   onConfirm: () => void;
//   setBookingDetails: (details: BookingDetails) => void;
//   service?: CartItem;
//   cartServices: CartItem[];
// }

interface BookingDetails {
  date: string;
  time: string;
  address: string;
  phoneNo: string;
  pincode: string;
  remarks: string;
}

const categoryDisplayNames = {
  [Category.AC_SERVICE]: "AC Service",
  [Category.BATHROOM_KITCHEN_CLEANING]: "Bathroom & kitchen cleaning",
  [Category.CARPENTER]: "Carpenter",
  [Category.CHIMNEY_REPAIR]: "Chimney Repair",
  [Category.ELECTRICIAN]: "Electrician",
  [Category.MICROWAVE_REPAIR]: "Microwave Repair",
  [Category.PLUMBERS]: "Plumbers",
  [Category.REFRIGERATOR_REPAIR]: "Refrigerator Repair",
  [Category.SOFA_CARPET_CLEANING]: "Sofa & Carpet Cleaning",
  [Category.WASHING_MACHINE_REPAIR]: "Washing Machine Repair",
  [Category.WATER_PURIFIER_REPAIR]: "Water Purifier Repair",
};

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortType, setSortType] = useState('low-to-high');
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    address: "",
    phoneNo: "",
    pincode: "",
    remarks: "",
  });
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // const fetchCategories = async () => {
  //   try {
  //     await fetch("/api/categories");
  //   } catch (error) {
  //     console.error("Error fetching categories:", error);
  //   }
  // };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (category && category !== "all") params.append("category", category);
  
      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
  
      // Sort data before updating state
      const sortedData = [...data]; // Create a copy to avoid direct mutation
      if (sortType === 'low-to-high') {
        sortedData.sort((a, b) => a.price - b.price);
      } else if (sortType === 'high-to-low') {
        sortedData.sort((a, b) => b.price - a.price);
      } else if (sortType === 'top-orders') {
        sortedData.sort((a, b) => b.numberoforders - a.numberoforders); // Sorting based on orders in descending order
      }
  
      setServices(sortedData); // Update state with the sorted data
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestClick = async () => {
    try {
      await fetch("/api/services/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: query }),
      });
    } catch (error) {
      console.error("Error requesting service:", error);
    }
  };

  // useEffect(() => {
  //   fetchCategories();
  // }, []);

  useEffect(() => {
    fetchServices();
  }, [query, category]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSortOpen && !(event.target as Element).closest('.sort-container')) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateURL({ query: value, category });
  };

  const handleSort = (type: string) => {
    setSortType(type);
    const sortedData = [...services];
  
    if (type === 'low-to-high') {
      sortedData.sort((a, b) => a.price - b.price);
    } else if (type === 'high-to-low') {
      sortedData.sort((a, b) => b.price - a.price);
    } else if (type === 'top-orders') {
      sortedData.sort((a, b) => b.numberoforders - a.numberoforders);
    }
  
    setServices(sortedData);
  };

  const handleCategoryClick = (selectedCategory: string) => {
    setCategory(selectedCategory);
    updateURL({ query, category: selectedCategory });
  };

  const updateURL = ({
    query,
    category,
  }: {
    query: string;
    category: string;
  }) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (category && category !== "all") params.set("category", category);

    router.replace(`/services?${params.toString()}`);

  };

  const addToCart = (service: Service) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === service.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...service, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (serviceId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== serviceId)
    );
  };

  const updateQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(serviceId);
      return;
    }
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === serviceId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!session) {
      toast.error("Please sign in to continue");
      router.push("/signin");
      return;
    }

    // Validate all required fields first
    if (!bookingDetails.address.trim()) {
      toast.error("Please provide a delivery address");
      return;
    }

    if (!bookingDetails.phoneNo.trim()) {
      toast.error("Please provide a phone number");
      return;
    }

    if (!bookingDetails.pincode.trim()) {
      toast.error("Please provide a pincode");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(bookingDetails.phoneNo)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // Validate pincode format
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(bookingDetails.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    // Validate date and time based on cart items
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (cart.length === 1) {
      // Single service validation
      if (
        !validateDateTime(bookingDetails.date, bookingDetails.time, {
          threshold: cart[0].threshold,
          name: cart[0].name,
        })
      ) {
        return;
      }
    } else {
      // Multiple services validation
      const servicesWithThreshold = cart.map((service) => ({
        threshold: service.threshold,
        name: service.name,
      }));

      if (!validateDateTimeForServices(bookingDetails.date, bookingDetails.time, servicesWithThreshold)) {
        return;
      }
    }

    setIsProcessing(true);
    try {
      // Format the date correctly
      const bookingDate = new Date(
        `${bookingDetails.date}T${bookingDetails.time}`
      );

      // Create an order for each service in the cart
      const orderPromises = cart.map((item) =>
        fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: item.id,
            date: bookingDate.toISOString(),
            time: bookingDetails.time,
            address: bookingDetails.address,
            pincode: bookingDetails.pincode,
            remarks: bookingDetails.remarks,
            amount: item.price * item.quantity,
          }),
        })
      );

      const responses = await Promise.all(orderPromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      // Check if all orders were successful
      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        setIsCheckoutModalOpen(false);
        setIsCartOpen(false);
        toast.success("Finding the best partner for your service...");
        clearCart();

        await new Promise((resolve) => setTimeout(resolve, 3000));
        router.push('/user/dashboard');
      } else {
        throw new Error("Failed to create one or more orders");
      }
    } catch (error) {
      console.error("Checkout error:", error);

      // Handle specific error cases
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      if (errorMessage.includes("No service providers available")) {
        toast.error(
          "No service providers are currently available in your area. Please try again later."
        );
      } else if (errorMessage.includes("Network")) {
        toast.error("Network error. Please check your internet connection.");
      } else if (errorMessage.includes("date")) {
        toast.error(
          "Invalid booking date or time. Please select a valid date and time."
        );
      } else if (errorMessage.includes("pincode")) {
        toast.error("Service not available in this pincode area.");
      } else if (errorMessage.includes("slots")) {
        toast.error(
          "Selected time slot is no longer available. Please choose another time."
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Toaster position="top-center" />

      <div className="h-5"></div>
      <div className="flex flex-1 mt-16">
        {/* Categories Sidebar */}
        <div className="w-64 bg-white p-4 shadow-lg h-full fixed">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-2">
            {["all", ...Object.values(Category)].map((cat) => (
              <li
                key={cat}
                className={`cursor-pointer p-2 rounded-md ${category === cat
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
                  }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat === "all" ? "All Services" : categoryDisplayNames[cat as Category]}
              </li>
            ))}
          </ul>

        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen ml-64 p-8 bg-gray-50">
          {/* Search Bar */}
          <div className="mb-8 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search services..."
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="relative sort-container">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="h-full px-6 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800"
              >
                <span>Sort</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      handleSort('high-to-low');
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9" />
                    </svg>
                    Price (High to Low)
                  </button>
                  <button
                    onClick={() => {
                      handleSort('low-to-high');
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5" />
                    </svg>
                    Price (Low to High)
                  </button>
                  <button
                    onClick={() => {
                      handleSort('top-orders');
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9" />
                    </svg>
                    Top Orders
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Services Grid */}
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <Image
                    src={service.image || "https://via.placeholder.com/150"}
                    alt={service.name}
                    className="w-full h-48 object-cover"
                    height={150}
                    width={150}
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">
                        ₹{service.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(service)}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {isLoading ? (
                <p className="text-gray-500 text-center">Loading services...</p>
              ) : (
                <div>
                  <p className="text-gray-500 text-center">No services found.</p>
                  <button
                    onClick={() => { handleRequestClick(); setIsClicked(true); }}
                    disabled={isClicked}
                    className={`w-full h-10 rounded-lg font-bold text-lg transition-all duration-300
                    ${isClicked
                        ? 'bg-gray-400 text-gray-800 cursor-not-allowed'
                        : 'bg-black text-white cursor-pointer hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-500'
                      }`}
                  >
                    {isClicked ? "Service Requested" : "Request Service"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Cart Sidebar */}
        <aside
          className={`fixed right-0 top-0 h-full w-80 bg-white z-20 shadow-lg transform transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cart ({cartItemCount})</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {cart.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 border-b"
                    >
                      <Image
                        src={item.image || "https://via.placeholder.com/50"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                        height={50}
                        width={50}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 bg-gray-100 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 mb-2"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            )}
          </div>
        </aside>

        {/* Cart Toggle Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 right-4 bg-gray-700 z-10 text-white p-4 rounded-full shadow-lg hover:bg-gray-600"
        >
          🛒 {cartItemCount > 0 && <span className="ml-1">{cartItemCount}</span>}
        </button>

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          isProcessing={isProcessing}
          bookingDetails={bookingDetails}
          onClose={() => setIsCheckoutModalOpen(false)}
          onConfirm={handleCheckout}
          setBookingDetails={setBookingDetails}
          cartServices={cart}
        />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-lg">Connecting you to a partner...</p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
