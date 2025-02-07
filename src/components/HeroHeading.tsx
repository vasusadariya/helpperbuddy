"use client";

import { motion } from "framer-motion";

const HeroHeadingTypewriter = () => {
  const text = "Reliable, Fast & Affordable Services";

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.h1
      className="text-4xl md:text-6xl font-bold mt-4 leading-tight overflow-hidden"
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.5,
            delay: index * 0.03,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default HeroHeadingTypewriter;