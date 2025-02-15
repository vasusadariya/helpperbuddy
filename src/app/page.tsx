"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, useAnimation } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
// import SearchBar from "@/components/searchbar"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import HeroSection from "@/components/HeroSection"
import ServiceSection from "@/components/ServicesSection"
import ReviewSection from "@/components/ReviewSection"
import FAQSection from "@/components/FAQSection"



export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeService, setActiveService] = useState(0)
  const [activeReview, setActiveReview] = useState(0)
  const [activeFAQ, setActiveFAQ] = useState(0)
  const controls = useAnimation()
  const faqControls = useAnimation()
  const serviceRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-white text-black">
      <Navbar />
      <HeroSection/>
      <ServiceSection />
      <ReviewSection />
      <FAQSection/>
      <Footer />
    </div>
  )
}

