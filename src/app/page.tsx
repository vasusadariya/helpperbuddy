"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import ServicesSection from "@/components/ServicesSection"
import TestimonialsSection from "@/components/TestimonialsSection"
import HowItWorksSection from "@/components/HowItWorksSection"
import CTASection from "@/components/CTASection"
import Footer from "@/components/Footer"

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

