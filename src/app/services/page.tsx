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

  // const [cartServices, setCartServices] = useState<Service[]>([]);
  // console.log(selectedService);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortType, setSortType] = useState('low-to-high');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(["all", ...data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (category && category !== "all") params.append("category", category);

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
      if (sortType === 'low-to-high') {
        setServices([...data].sort((a, b) => a.price - b.price));
      } else if (sortType === 'high-to-low') {
        setServices([...data].sort((a, b) => b.price - a.price));
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (type === 'low-to-high') {
      setServices([...services].sort((a, b) => a.price - b.price));
    } else if (type === 'high-to-low') {
      setServices([...services].sort((a, b) => b.price - a.price));
    }
    setSortType(type);
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

    // Replace the current history state instead of pushing a new one
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
        {/* Categories Sidebar - Desktop */}
        <div className="hidden md:block w-64 bg-white p-4 shadow-lg h-full fixed">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-2">
            {["all", ...Object.values(Category)].map((cat) => (
              <li
                key={cat}
                className={`cursor-pointer p-2 rounded-md ${
                  category === cat ? "bg-black text-white" : "hover:bg-gray-100"
                }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat === "all" ? "All Services" : categoryDisplayNames[cat as Category]}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen md:ml-64 p-8 bg-gray-50">
          {/* Search Bar and Mobile Menu */}
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
            
            {/* Mobile Categories Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden h-full px-6 bg-black text-white rounded-lg flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Sort Button */}
            <div className="relative sort-container hidden md:block">
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

              {/* Desktop Sort Dropdown */}
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {/* Your existing sort dropdown content */}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Categories and Sort Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
              <div 
                className="bg-white w-80 h-full absolute right-0 p-4 overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sort Options in Mobile Menu */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Sort By</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleSort('low-to-high');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5" />
                      </svg>
                      Price (Low to High)
                    </button>
                    <button
                      onClick={() => {
                        handleSort('high-to-low');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9" />
                      </svg>
                      Price (High to Low)
                    </button>
                  </div>
                </div>

                {/* Categories in Mobile Menu */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Categories</h3>
                  <ul className="space-y-2">
                    {["all", ...Object.values(Category)].map((cat) => (
                      <li
                        key={cat}
                        className={`cursor-pointer p-2 rounded-md ${
                          category === cat ? "bg-black text-white" : "hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          handleCategoryClick(cat);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {cat === "all" ? "All Services" : categoryDisplayNames[cat as Category]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Rest of your existing code */}
          {/* Services Grid */}
          {/* Cart Sidebar */}
          {/* Checkout Modal */}
          {/* Processing Overlay */}
        </main>
      </div>
      <Footer />
    </div>
);
}