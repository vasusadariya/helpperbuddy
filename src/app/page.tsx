'use client'
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
// import SearchBar from "@/components/searchbar"
import HeroSection from "@/components/HeroSection"
import ServiceSection from "@/components/ServicesSection"
import ReviewSection from "@/components/ReviewSection"
import FAQSection from "@/components/FAQSection"
import HowItWorksSection from "@/components/HowItWorksSection"
import LatestArticles from "@/components/LatestBlogs"



export default function Home() {
  return (
    <div className="bg-white text-black">
      <Navbar />
      <HeroSection/>
      <ServiceSection />
      <HowItWorksSection />
      <ReviewSection />
      <LatestArticles/>
      <FAQSection/>
      <Footer />
    </div>
  )
}

