"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (!userData.name || !userData.email || !userData.password) {
      setErrorMessage("All fields are required.");
      return;
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/user/dashboard");
    } else {
      setErrorMessage(data.error || "Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-4">User Signup</h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button onClick={handleSignup} className="w-full bg-blue-600 text-white p-2 rounded">
          Signup
        </button>
      </div>
    </div>
  );
}