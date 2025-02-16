"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"

const images = [
  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/AzGeNv8QxRTqXJan/people-taking-care-office-cleaning-AzG3G22GvPhxw7eO.jpg",
  "https://img.freepik.com/free-photo/part-male-construction-worker_329181-3734.jpg?t=st=1739610307~exp=1739613907~hmac=e1c2ae6d2ae9e52afc7135d98d006c8de0c54805d76f4a1b59a2da869b545ae7&w=996"
]

const ButtonWithArrow = () => {
  return (
    <Link href="/services">
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1, delay: 0.1 }}
        className="group relative inline-flex items-center mt-3 gap-2 overflow-hidden rounded-full border border-white px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-3 text-sm sm:text-base md:text-lg font-medium text-white transition-transform"
      >
        <span className="relative z-10 transition-colors duration-500 group-hover:text-black">
          Explore Services
        </span>
        <span className="relative z-10 flex items-center justify-center">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 bg-black items-center justify-center rounded-full transition-colors duration-500 group-hover:border-black">
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45 transition-transform duration-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </span>
        <div className="absolute left-0 top-0 h-full w-full -translate-x-full transform bg-white transition-transform duration-500 group-hover:translate-x-0" />
      </motion.button>
    </Link>
  )
}

interface ServiceCardProps {
  title: string;
  description: string;
}

const ServiceCard = ({ title, description }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 max-w-[300px] mx-auto w-full"
    >
      <h3 className="text-white text-lg sm:text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-200 text-sm sm:text-base text-center">{description}</p>
    </motion.div>
  )
}

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  }, []);

  const previousImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  }, []);
  <button onClick={previousImage}>Previous</button>

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        nextImage();
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, nextImage]);

  const handleImageChange = (index: number) => {
    setCurrentImage(index);
    setIsAutoPlaying(false);
    
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  return (
    <div className="w-full bg-white p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 md:pt-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1600px] mx-auto relative overflow-hidden rounded-[2rem] min-h-[600px] sm:min-h-[650px] md:min-h-[700px] lg:min-h-[750px]"
      >
        {/* Background Images Container */}
        <div className="absolute inset-0 bg-black"> {/* Black background to prevent flash */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.8,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                <Image
                  src={images[currentImage]}
                  alt={`Carousel image ${currentImage + 1}`}
                  className="object-cover opacity-80"
                  priority
                  sizes="100vw"
                  height={600}
                  width={1600}
                />
                <div className="absolute inset-0 bg-black/20" /> {/* Consistent overlay */}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation */}
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`w-12 h-2 rounded-sm transition-all duration-300 ${
                currentImage === index 
                  ? 'bg-white' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="relative h-full flex flex-col justify-between px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-16">
          {/* Top Content */}
          <div className="max-w-[600px] space-y-4 sm:space-y-6 pt-4 sm:pt-6 mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold text-white leading-tight"
            >
              Reliable, Fast & Affordable Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg text-gray-200 max-w-xl mx-auto"
            >
              Your Helper Buddy is Just a Click Away
            </motion.p>
            <div className="flex justify-center">
              <ButtonWithArrow />
            </div>
          </div>

          {/* Services Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-20 max-w-5xl mx-auto px-4">
            <ServiceCard
              title="Home & Office Cleaning"
              description="Expert cleaning tailored to your space, using eco-friendly products"
            />
            <ServiceCard
              title="Appliance Repair & Maintenance"
              description="Quick, reliable appliance repairs and maintenance"
            />
            <ServiceCard
              title="Plumbing & Electrical"
              description="Trusted plumbing and electrical services, with emergency response"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}