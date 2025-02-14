"use client";

import { motion } from "framer-motion";

const HeroHeading = () => {
  return (
    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight font-inter">
      Your <br />
      <span className="text-5xl md:text-7xl bg-gradient-to-r from-emerald-500 to-emerald-900 text-transparent bg-clip-text">Helper Buddy</span>{" "}
      is<br />
      Just a Click Away!
    </h1>
  );
};

export default HeroHeading;