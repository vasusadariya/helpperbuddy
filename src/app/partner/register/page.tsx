"use client"; // Required for client-side rendering

import React, { useState } from "react";

export default function PartnerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    services: "",
    pincodes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Wait for admin approval.");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Partner Registration</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />
          <input
            type="text"
            name="services"
            placeholder="Services (comma-separated)"
            value={formData.services}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />
          <input
            type="text"
            name="pincodes"
            placeholder="Pincodes (comma-separated)"
            value={formData.pincodes}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Register as Partner
          </button>
        </form>
      </div>
    </div>
  );
}
