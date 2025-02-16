'use client';

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
}

const fetchServices = async () => {
  const res = await fetch('/api/home-page/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
};

const ServiceSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const cardsToShow = 3;

  useEffect(() => {
    fetchServices().then(setServices).catch(console.error);
  }, []);

  const maxIndex = Math.max(0, services.length - cardsToShow);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-sliding functionality
  useEffect(() => {
    if (!autoPlay) return;

    const intervalId = setInterval(nextSlide, 5000); // Slide every 5 seconds

    return () => clearInterval(intervalId);
  }, [autoPlay, nextSlide]);

  if (!services.length) return null;

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center md:text-left dark:text-white">
            Our Services
          </h2>
          <Link
            href="/services"
            className="text-black dark:text-white hover:underline mt-4 md:mt-0"
          >
            View All
          </Link>
        </div>

        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                prevSlide();
                setAutoPlay(false);
              }}
              className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors z-10"
              aria-label="Previous slide"
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
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0"
                  >
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg h-[400px] flex flex-col">
                      {service.image ? (
                        <div className="relative h-48 w-full flex-shrink-0">
                          <Image
                            src={service.image}
                            alt={service.name}
                            className="object-cover"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            priority
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-lg md:text-xl font-semibold mb-2 dark:text-white">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 flex-grow text-sm md:text-base">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xl md:text-2xl font-bold dark:text-white">
                            ₹{service.price}
                          </span>
                          <Link
                            href={`/book/${service.id}`}
                            className="bg-black dark:bg-white text-white dark:text-black px-4 md:px-6 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors whitespace-nowrap"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <button
              onClick={() => {
                nextSlide();
                setAutoPlay(false);
              }}
              className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;