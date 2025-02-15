"use client";

import { motion } from "framer-motion";
import { ArrowRight, Home, Briefcase, Wind } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-black">
              Professional Cleaning
              <span className="text-primary block mt-2">At Your Doorstep</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Experience the finest cleaning services across India. We bring professional
              expertise to your homes, offices, and AC units.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-8 py-4 rounded-full flex items-center gap-2 text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Book Now <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Home, label: "Home Cleaning", color: "bg-blue-100" },
                { icon: Briefcase, label: "Office Cleaning", color: "bg-green-100" },
                { icon: Wind, label: "AC Cleaning", color: "bg-purple-100" },
              ].map((service, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`${service.color} p-6 rounded-2xl ${
                    index === 2 ? "col-span-2" : ""
                  }`}
                >
                  <service.icon className="w-10 h-10 mb-3" />
                  <h3 className="font-semibold">{service.label}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}