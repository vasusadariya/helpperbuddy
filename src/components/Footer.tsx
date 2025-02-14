import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import logo from "../../public/logo.png"; // Adjust the path to your logo file

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image src={logo} alt="Helper Buddy Logo" width={150} height={50} />
            <p className="mt-4 text-gray-400">
              Your trusted partner for all your home cleaning needs.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <p className="text-gray-400 hover:text-white">About Us</p>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <p className="text-gray-400 hover:text-white">Services</p>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <p className="text-gray-400 hover:text-white">Contact</p>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <p className="text-gray-400 hover:text-white">Careers</p>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog">
                  <p className="text-gray-400 hover:text-white">Blog</p>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <p className="text-gray-400 hover:text-white">FAQ</p>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <p className="text-gray-400 hover:text-white">Support</p>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <p className="text-gray-400 hover:text-white">Privacy Policy</p>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/yourprofile" className="text-gray-400 hover:text-white">
                <FaFacebook size={24} />
              </a>
              <a href="https://www.twitter.com/yourprofile" className="text-gray-400 hover:text-white">
                <FaTwitter size={24} />
              </a>
              <a href="https://www.instagram.com/yourprofile" className="text-gray-400 hover:text-white">
                <FaInstagram size={24} />
              </a>
              <a href="https://www.linkedin.com/yourprofile" className="text-gray-400 hover:text-white">
                <FaLinkedin size={24} />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-gray-400">123 Main Street, Surat, Gujarat, India</p>
              <p className="text-gray-400">Phone: +91 12345 67890</p>
              <p className="text-gray-400">Email: info@helperbuddy.com</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Helper Buddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
