import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    image: "/testimonial1.jpg",
    quote: "Helper Buddy has been a game-changer for our family. Their service is reliable, thorough, and always leaves our home spotless!"
  },
  {
    name: "Michael Chen",
    role: "Busy Professional",
    image: "/testimonial2.jpg",
    quote: "I can't imagine my life without Helper Buddy now. They've given me back my weekends and peace of mind."
  },
  {
    name: "Emily Rodriguez",
    role: "Working Mom",
    image: "/testimonial3.jpg",
    quote: "Helper Buddy's eco-friendly cleaning options have made a huge difference in our home. It's great to have a clean house and a clean conscience!"
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
          <p className="mt-4 text-xl text-gray-600">Don't just take our word for it</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-6">
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
