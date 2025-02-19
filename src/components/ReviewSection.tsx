"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  name: string;
  rating: number;
  review: string;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [autoPlay, setAutoPlay] = useState(true);
  const [cardsToShow, setCardsToShow] = useState(3);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Handle responsive cardsToShow
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const numSlides = Math.ceil(reviews.length / cardsToShow);

  const nextSlide = useCallback(() => {
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev + 1) % numSlides);
  }, [numSlides]);

  const prevSlide = useCallback(() => {
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? numSlides - 1 : prev - 1));
  }, [numSlides]);

  useEffect(() => {
    if (!autoPlay || reviews.length === 0) return;
    
    const interval = setInterval(() => {
      setSlideDirection('right');
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [reviews.length, autoPlay, nextSlide]);

  const getVisibleReviews = () => {
    const start = currentIndex * cardsToShow;
    const end = start + cardsToShow;
    if (end <= reviews.length) {
      return reviews.slice(start, end);
    } else {
      const remainingSlots = cardsToShow - (reviews.length - start);
      return [...reviews.slice(start), ...reviews.slice(0, remainingSlots)];
    }
  };

  const slideVariants = {
    enter: (direction: string) => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? -1000 : 1000,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 dark:text-white">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(cardsToShow)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
                <Skeleton className="h-10 sm:h-12 w-10 sm:w-12 rounded-full mb-3 sm:mb-4" />
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-2" />
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-3 sm:mb-4" />
                <Skeleton className="h-16 sm:h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 dark:text-white">
          What Our Customers Say
        </h2>
        
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                prevSlide();
                setAutoPlay(false);
              }}
              className="p-1.5 sm:p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors z-10"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            
            <div className="overflow-hidden mx-2 sm:mx-4 flex-1">
              <AnimatePresence
                mode="wait"
                initial={false}
                custom={slideDirection}
              >
                <motion.div
                  key={currentIndex}
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="grid grid-cols-1 pb-4 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {getVisibleReviews().map((review, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="w-full"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg h-full">
                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300">
                              {review.name[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold dark:text-white mb-1">
                              {review.name}
                            </h3>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-4 sm:line-clamp-none">
                          {review.review}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={() => {
                nextSlide();
                setAutoPlay(false);
              }}
              className="p-1.5 sm:p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors z-10"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}