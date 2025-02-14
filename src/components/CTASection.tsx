import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready for a Cleaner, Happier Home?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Book your first cleaning session today and enjoy a special introductory offer!
          </p>
          <div className="mt-8">
            <motion.button
              onClick={() => router.push("/book")}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
