'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, UserCheck, Brush, Home } from 'lucide-react';

const steps = [
  {
    Icon: Calendar,
    title: "Book Online",
    description: "Schedule your preferred cleaning service and time"
  },
  {
    Icon: UserCheck,
    title: "We Match You",
    description: "We'll connect you with an experienced, reliable cleaner for your space"
  },
  {
    Icon: Brush,
    title: "Get it Clean",
    description: "Our professionals will thoroughly clean your home, office, or AC units"
  },
  {
    Icon: Home,
    title: "Enjoy Your Space",
    description: "Return to a fresh, healthy, and perfectly cleaned environment"
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-11">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Simple steps to a cleaner home
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center w-full max-w-xs px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="bg-gray-100 rounded-full p-6 mb-6">
                <step.Icon 
                  className="h-12 w-12 text-gray-600" 
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;