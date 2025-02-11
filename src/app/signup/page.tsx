"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneno: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      if (!res.ok) {
        const errorText = await res.text(); // Read raw error message
        setErrorMessage(errorText || "Signup failed.");
        return;
      }
  
      // Check if response has JSON data
      let data;
      try {
        data = await res.json();
      } catch (error) {
        setErrorMessage("Invalid server response. Please try again.");
        return;
      }
  
      router.push("/user/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg p-8 bg-white border border-gray-200 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">User Signup</h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="phoneno" // ✅ Using "phoneno" instead of "phone"
          placeholder="Phone Number"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Signup
        </button>
      </div>
    </div>
  );
}