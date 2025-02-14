import { motion } from 'framer-motion';
import { FaHome, FaBroom, FaTshirt, FaLeaf } from 'react-icons/fa';

const services = [
  { icon: FaHome, title: "Home Cleaning", description: "Comprehensive cleaning for your entire home" },
  { icon: FaBroom, title: "Deep Cleaning", description: "Thorough cleaning for those hard-to-reach areas" },
  { icon: FaTshirt, title: "Laundry Service", description: "Professional washing and folding of your clothes" },
  { icon: FaLeaf, title: "Eco-Friendly Options", description: "Green cleaning solutions for a healthier home" },
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Services</h2>
          <p className="mt-4 text-xl text-gray-600">Tailored solutions for all your cleaning needs</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <service.icon className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
