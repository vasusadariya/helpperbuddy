import type React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Briefcase, Home, Wind, PenToolIcon as Tool } from "lucide-react";
import Image from "next/image";

function ServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            {/* Left Side (Text) */}
        <div className="md:w-1/2 text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Our Services
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl">
            HelperBuddy offers professional house, office, and AC cleaning
            services across India, delivering top-quality, eco-friendly solutions
            tailored to your needs. Our trusted team ensures your spaces are spotless,
            fresh, and well-maintained.
          </p>
        </div>

        {/* Right Side (Image) */}
        <div className="md:w-1/2 h-full">
          <div className="aspect-w-16 aspect-h-9 md:aspect-h-full">
            <Image
              src="/logo.png"
              alt="Helper Buddy Services"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-12">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900">
                About Helper Buddy
              </h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <p className="text-gray-700 mb-4">
                Helper Buddy is a professional service provider based in Surat,
                Gujarat. We specialize in house, office, and AC cleaning
                services, as well as installations and other related services.
              </p>
              <p className="text-gray-700">
                Our top-quality, eco-friendly solutions are tailored to meet
                each customer's unique needs. We focus on delivering exceptional
                results and ensuring every project is handled with care and
                professionalism.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <ServiceCard
              icon={<Home className="h-8 w-8 text-blue-500" />}
              title="House Cleaning"
              description="Comprehensive cleaning services for your home, ensuring a spotless and hygienic living environment."
            />
            <ServiceCard
              icon={<Briefcase className="h-8 w-8 text-green-500" />}
              title="Office Cleaning"
              description="Professional cleaning solutions for workspaces, promoting a clean and productive office environment."
            />
            <ServiceCard
              icon={<Wind className="h-8 w-8 text-red-500" />}
              title="AC Cleaning"
              description="Thorough cleaning and maintenance of air conditioning units to improve efficiency and air quality."
            />
            <ServiceCard
              icon={<Tool className="h-8 w-8 text-purple-500" />}
              title="Installations"
              description="Expert installation services for various appliances and equipment in both homes and offices."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold text-gray-900 p-4 bg-gray-100">
                Our Location
              </h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.70349983633!2d72.84815527543446!3d21.24360298045997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xaf2e30a69314d2c9%3A0x801c0b6392faabac!2sHelper%20Buddy!5e0!3m2!1sen!2sin!4v1739825118680!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold text-gray-900 p-4 bg-gray-100">
                connect with us
              </h3>
              <div className="aspect-w-16 aspect-h-9 relative">
                insta
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition duration-300">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default ServicePage;
