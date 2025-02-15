"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Priya Singh",
    rating: 5,
    review: "Exceptional service! The team was professional and thorough.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Rahul Sharma",
    rating: 5,
    review: "Best cleaning service I've ever experienced. Highly recommended!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Anita Patel",
    rating: 4,
    review: "Very satisfied with the AC cleaning service. Will definitely use again!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Vikram Mehta",
    rating: 5,
    review: "Professional team, great attention to detail. My office looks spotless!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Meera Reddy",
    rating: 5,
    review: "Outstanding deep cleaning service. They transformed my home completely!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Meera Reddy",
    rating: 5,
    review: "Outstanding deep cleaning service. They transformed my home completely!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Meera Reddy",
    rating: 5,
    review: "Outstanding deep cleaning service. They transformed my home completely!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  },
];

export default function ReviewSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reviewsToShow = 3;
  const maxIndex = reviews.length - reviewsToShow;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>
        
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
                animate={{ x: `${-currentIndex * (100 / reviewsToShow)}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex gap-6"
                style={{ width: `${(reviews.length / reviewsToShow) * 100}%` }}
              >
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="w-full"
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-lg h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={review.image}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{review.name}</h3>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.review}</p>
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