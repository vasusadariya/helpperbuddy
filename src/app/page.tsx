"use client"

import Navbar from "@/components/Navbar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeroHeading from "@/components/HeroHeading";
import SearchBar from '@/components/searchbar';
import Footer from '@/components/Footer';
import HeroSection from "@/components/HeroSection"
import ServicesSection from "@/components/ServicesSection"
import TestimonialsSection from "@/components/TestimonialsSection"
import HowItWorksSection from "@/components/HowItWorksSection"
import CTASection from "@/components/CTASection"

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="bg-black text-white">
      {/* Hero Section with Navbar Inside */}
      <section className="relative bg-white text-black flex flex-col md:flex-row items-center px-6 md:px-10 py-20 min-h-[80vh] rounded-bl-[97px] rounded-br-[97px]">
        {/* Navbar inside Hero Section */}
        <div className="absolute top-0 left-0 w-full z-10">
          <Navbar />
        </div>

        {/* Left Side */}
        <div className="md:w-1/2 text-center md:text-left mt-16 md:mt-10 z-10">
          <HeroHeading />

          <p className="text-gray-600 mt-4 max-w-md">
            delivering top-quality, eco-friendly solutions tailored to your needs. Our trusted team ensures your spaces are spotless, fresh, and well-maintained.
          </p>
          <h2 className="text-2xl md:text-xl font-bold mt-4 leading-tight">
            Reliable, Fast & Affordable Services
          </h2>
          <div className="mt-6 flex justify-center md:justify-start space-x-4">
            <button
              className="relative px-4 py-2 rounded-full font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-900 bg-opacity-30 backdrop-blur-xl shadow-lg hover:scale-105 transition-all duration-200"
              onClick={() => router.push("/services")}
            >
              Book Services
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center relative">
          <div className="relative">
            {/* <Image
              src="/image.png"
              alt="Hero"
              width={400}
              height={400}
              className="rounded-lg"
            /> */}
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white p-10 md:p-20">
        <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-6">
          <div>
            <span className="text-3xl font-bold text-yellow-400">2000+</span>
            <p className="text-gray-400">Company</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-yellow-400">10+</span>
            <p className="text-gray-400">Years Exp.</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-yellow-400">800+</span>
            <p className="text-gray-400">Hours of Digital</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-yellow-400">150M+</span>
            <p className="text-gray-400">In Tracked Revenue</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Search for a Service</h2>
        <SearchBar />
      </section>
      <section className="bg-white p-10"> </section>
      <Footer />
    </div>
  )
}

