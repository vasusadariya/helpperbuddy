"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What areas do you service in India?",
    answer: "We currently operate in all major cities across India, including Delhi, Mumbai, Bangalore, Chennai, and Hyderabad. Our extensive network ensures reliable and consistent service quality across locations.",
  },
  {
    question: "What's included in your deep cleaning service?",
    answer: "Our comprehensive deep cleaning service covers everything from floor-to-ceiling cleaning, including dusting, mopping, sanitization, carpet cleaning, window cleaning, and bathroom deep cleaning. We use professional-grade equipment and eco-friendly cleaning solutions.",
  },
  {
    question: "How often should I get my AC serviced?",
    answer: "We recommend servicing your AC every 3-6 months for optimal performance and longevity. Regular maintenance helps prevent major issues, ensures energy efficiency, and maintains air quality. During peak seasons, more frequent servicing might be beneficial.",
  },
  {
    question: "What are your pricing plans?",
    answer: "Our pricing is transparent and competitive, varying based on the service type and property size. We offer both one-time services and subscription plans with special discounts. Contact us for a detailed quote tailored to your needs.",
  },
  {
    question: "How do you ensure service quality?",
    answer: "We maintain high service standards through rigorous staff training, quality checks, and customer feedback systems. Our cleaning professionals are background-verified and follow strict protocols. We also offer a satisfaction guarantee with every service.",
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAutoPlaying) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev + 1) % 100);
      }, 50);

      const interval = setInterval(() => {
        setAutoPlayIndex((prev) => (prev + 1) % faqs.length);
        setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % faqs.length));
        setProgress(0);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
      };
    }
  }, [isAutoPlaying]);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
    setIsAutoPlaying(false);
    setAutoPlayIndex(index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Find answers to common questions about our services
            </p>
          </div>

          <div className="relative mb-8 h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-black"
              animate={{
                width: isAutoPlaying ? `${progress}%` : "0%",
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{ 
                  backgroundColor: autoPlayIndex === index ? "rgb(249, 250, 251)" : "rgb(255, 255, 255)"
                }}
                className="border border-gray-200 rounded-xl overflow-hidden transition-colors duration-300"
              >
                <motion.button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-left">{faq.question}</span>
                  <motion.div
                    animate={{ 
                      rotate: activeIndex === index ? 45 : 0,
                      backgroundColor: activeIndex === index ? "rgb(0, 0, 0)" : "rgb(229, 231, 235)"
                    }}
                    className="p-2 rounded-full"
                  >
                    {activeIndex === index ? (
                      <Minus className="w-4 h-4 text-white" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-600" />
                    )}
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-4">
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-600"
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}