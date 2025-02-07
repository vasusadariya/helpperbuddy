"use client";


import Navbar from "@/components/Navbar";
import Image from "next/image";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeroHeading from "@/components/HeroHeading";


export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="bg-black text-white">
      {/* Hero Section with Navbar Inside */}
      <section className="relative bg-white text-black flex flex-col md:flex-row items-center px-6 md:px-10 py-20 min-h-[80vh] rounded-bl-[97px] rounded-br-[97px]">
        {/* Navbar inside Hero Section */}
        <div className="absolute top-4 left-0 w-full z-10 px-6 md:px-10">
          <Navbar />
        </div>

        {/* Left Side */}
        <div className="md:w-1/2 text-center md:text-left mt-16 md:mt-20">
          <span className="bg-gray-200 text-sm px-4 py-1 rounded-full">
            🚀 Delivering eco-friendly and tailor-made solutions
          </span>
          {/* <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
          Reliable, Fast & Affordable Services
          </h1> */}

          <HeroHeading/>
          
          <p className="text-gray-600 mt-4 max-w-md">
          delivering top-quality, eco-friendly solutions tailored to your needs. Our trusted team ensures your spaces are spotless, fresh, and well-maintained.
          </p>
          <h2 className="text-2xl md:text-xl font-bold mt-4 leading-tight">
          Your Helper Buddy is Just a Click Away!
          </h2>
          <div className="mt-6 flex justify-center md:justify-start space-x-4">
          <button className="relative bg-yellow-400 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-600 shadow-[6px_6px_0px_black] hover:shadow-[4px_4px_0px_black] transition-all duration-200"
          onClick={() => router.push("/partner/register")}>
  partner
</button>

<button className="relative bg-yellow-400 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-600 shadow-[6px_6px_0px_black] hover:shadow-[4px_4px_0px_black] transition-all duration-200"
          onClick={() => router.push("/signup")}>
  signup
</button>

<button className="relative border border-black px-6 py-3 rounded-full font-medium hover:bg-gray-300 hover:text-white shadow-[6px_6px_0px_black] hover:shadow-[4px_4px_0px_black] transition-all duration-200"
onClick={()=>{router.push("/admin/approvals")} }>
  admin aprrovals
</button>




          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center relative">
          <div className="relative">
            <Image
              src="/image.png"
              alt="Hero"
              width={400}
              height={400}
              className="rounded-lg"
            />
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white p-10 md:p-20">
        <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-6">
          <div>
            <span className="text-3xl font-bold text-yellow-400">2000+</span>
            <p className="text-gray-400">Company</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-yellow-400">10+</span>
            <p className="text-gray-400">Years Exp.</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-yellow-400">800+</span>
            <p className="text-gray-400">Hours of Digital</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-yellow-400">150M+</span>
            <p className="text-gray-400">In Tracked Revenue</p>
          </div>
        </div>
      </section>

    </div>
  );
}
