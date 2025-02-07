"use client"

import React from 'react'

function Navbar() {
  return (
    <div>
        <header className="flex justify-between items-center p-3 bg-black text-white rounded-full">
        <div className="text-2xl font-bold flex items-center space-x-2">
          <span className="text-yellow-500">●</span>
          <span>Helper Buddy</span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-yellow-400">Home</a>
          <a href="#" className="hover:text-yellow-400">Services</a>
          <a href="#" className="hover:text-yellow-400">Blogs</a>
          <a href="#" className="hover:text-yellow-400">Contact</a>
          <a href="#" className="hover:text-yellow-400">About Us</a>
          <a href="#" className="hover:text-yellow-400">Be Partner</a>

        </nav>
        <button className="border border-white px-4 py-2 rounded-full hover:bg-white hover:text-black">
          Login/signup
        </button>
      </header>
    </div>
  )
}

export default Navbar
