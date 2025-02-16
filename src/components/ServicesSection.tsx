"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const services = [
  {
    name: "Home Deep Cleaning",
    price: "₹2999",
    description: "Complete home cleaning with premium equipment",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Office Sanitization",
    price: "₹3999",
    description: "Professional office cleaning and sanitization",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "AC Service",
    price: "₹799",
    description: "Complete AC cleaning and maintenance",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Carpet Cleaning",
    price: "₹1499",
    description: "Deep carpet cleaning and stain removal",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Window Cleaning",
    price: "₹999",
    description: "Professional window and glass cleaning",
    image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&q=80&w=400",
  }
];

export default function ServiceSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 3;
  const maxIndex = services.length - cardsToShow;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>

        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="overflow-hidden mx-4 flex-1">
              <motion.div
                animate={{ x: `${-currentIndex * (100 / cardsToShow)}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex gap-6"
                style={{ width: `${(services.length / cardsToShow) * 100}%` }}
              >
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="w-full"
                  >
                    <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={service.image}
                        alt={service.name}
                        className="w-full h-48 object-cover"
                        width={400}
                        height={200}
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{service.price}</span>
                          <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}