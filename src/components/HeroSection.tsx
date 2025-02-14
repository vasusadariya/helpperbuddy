import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative bg-gradient-to-r from-blue-50 to-indigo-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="md:flex md:items-center md:space-x-8">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Your Trusted Helper for a Cleaner, Happier Home
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience top-quality, eco-friendly cleaning solutions tailored to your needs. Let us take care of your space while you focus on what matters most.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.push("/book")}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Book Now
              </button>
              <button
                onClick={() => router.push("/services")}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Our Services
              </button>
            </div>
          </motion.div>
          <motion.div 
            className="mt-10 md:mt-0 md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src="/hero-image.jpg"
              alt="Happy family in a clean home"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
