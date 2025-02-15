"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "What is HelperBuddy?",
        answer: "HelperBuddy is a cleaning service that helps keep your home and office clean. We also clean air conditioning units. Our goal is to make your spaces fresh and healthy.",
    },
    {
        question: "What cleaning services do you offer?",
        answer: "We offer a variety of cleaning services, including home cleaning, office cleaning, and AC cleaning. Whether you need a deep clean or regular maintenance, we've got you covered.",
    },
    {
        question: "How do I book a cleaning service?",
        answer: "Booking is easy! Just give us a call or fill out our online form. We'll set up a time that works best for you.",
    },
    {
        question: "How much does your service cost?",
        answer: "The cost depends on the size of your home or office and the type of cleaning you need. We have options for every budget. For exact prices, check our pricing page/contact us.",
    },
    {
        question: "Is HelperBuddy the best cleaning service in India?",
        answer: "Many of our customers think so! We pride ourselves on quality service and customer satisfaction. Check our reviews to see what others are saying.",
    },
    {
        question: "How can I find good cleaning services near me?",
        answer: "If you're looking for reliable cleaning services nearby, Helper Buddy is the answer. We connect you with experienced cleaners who can handle everything from regular home cleaning to deep cleaning. Simply book through our platform, and we'll send a trusted professional to your home.",
    }
];

export default function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [autoPlayIndex, setAutoPlayIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [manualClickTime, setManualClickTime] = useState<number | null>(null);

    // Handle auto-play progress
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

    // Handle manual click progress
    useEffect(() => {
        if (!isAutoPlaying && manualClickTime !== null) {
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 99) {
                        // Move to next FAQ when progress is complete
                        const nextIndex = (autoPlayIndex + 1) % faqs.length;
                        setActiveIndex(nextIndex);
                        setAutoPlayIndex(nextIndex);
                        setProgress(0);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 50);

            return () => {
                clearInterval(progressInterval);
            };
        }
    }, [isAutoPlaying, manualClickTime, autoPlayIndex]);

    const toggleFAQ = (index: number) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
            setAutoPlayIndex(index);
            setProgress(0);
            setIsAutoPlaying(false);
            setManualClickTime(Date.now());
        }
    };

    return (
        <section className="py-24 bg-white">
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
                                width: `${progress}%`,
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
                                            rotate: activeIndex === index ? 180 : 0,
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