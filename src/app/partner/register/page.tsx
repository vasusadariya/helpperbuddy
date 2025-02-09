"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  category: Category;
}

interface CategoryServices {
  category: Category;
  displayName: string;
  services: Service[];
}

export default function PartnerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pincodes: "",
  });

  const [categorizedServices, setCategorizedServices] = useState<CategoryServices[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await fetch('/api/service-categories');
        const data = await response.json();
        setCategorizedServices(data);
      } catch (error) {
        console.error('Error fetching service categories:', error);
      }
    };
    fetchServiceCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (category: Category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // Remove category
        const newCategories = prev.filter(c => c !== category);
        // Remove all services from this category
        setSelectedServices(prev => 
          prev.filter(serviceName => 
            !categorizedServices
              .find(cs => cs.category === category)
              ?.services.some(s => s.name === serviceName)
          )
        );
        return newCategories;
      } else {
        // Add category
        if (!expandedCategories.includes(category)) {
          setExpandedCategories(prev => [...prev, category]);
        }
        return [...prev, category];
      }
    });
  };

  const handleServiceChange = (serviceName: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        return prev.filter(name => name !== serviceName);
      } else {
        return [...prev, serviceName];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      serviceTypes: selectedCategories,
      services: selectedServices,
      pincodes: formData.pincodes.split(",").map(p => p.trim()),
    };

    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Services Selection Menu */}
          <div className="border rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold px-4 py-2 bg-gray-50">Services Selection</h3>
            <div className="max-h-96 overflow-y-auto">
              {categorizedServices.map(({ category, displayName, services }) => (
                <div key={category} className="border-t">
                  <div 
                    className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCategoryChange(category);
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="font-medium">{displayName}</span>
                    </div>
                    {expandedCategories.includes(category) ? 
                      <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    }
                  </div>
                  
                  {/* Services Submenu */}
                  <div className={`bg-gray-50 transition-all duration-200 ease-in-out ${
                    expandedCategories.includes(category) ? 'max-h-96' : 'max-h-0'
                  } overflow-hidden`}>
                    {services.map(service => (
                      <label 
                        key={service.id} 
                        className="flex items-center space-x-2 px-8 py-2 hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.name)}
                          onChange={() => handleServiceChange(service.name)}
                          disabled={!selectedCategories.includes(category)}
                          className="rounded border-gray-300"
                        />
                        <span className={`${!selectedCategories.includes(category) ? 'text-gray-400' : ''}`}>
                          {service.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincodes</label>
            <input
              type="text"
              name="pincodes"
              placeholder="Enter comma-separated pincodes"
              value={formData.pincodes}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Register as Partner
          </button>
        </form>
      </div>
    </div>
  );
}