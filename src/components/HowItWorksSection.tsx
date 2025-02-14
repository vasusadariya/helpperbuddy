import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUserCheck, FaBroom } from 'react-icons/fa';

const steps = [
  { icon: FaCalendarAlt, title: "Book Online", description: "Choose your service and preferred time" },
  { icon: FaUserCheck, title: "We Match You", description: "Get paired with a trusted, experienced cleaner" },
  { icon: FaBroom, title: "Get it Clean", description: "Enjoy a spotless home, hassle-free" },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-xl text-gray-600">Simple steps to a cleaner home</p>
        </div>
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="bg-blue-100 rounded-full p-6 mb-4">
                <step.icon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
