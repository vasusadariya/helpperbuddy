import ContactForm from "@/components/ContactForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar /> 
      <div className="flex-grow flex items-center justify-center px-4 pt-40 pb-20">
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
