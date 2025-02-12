'use client';
import React, { useState } from "react";

interface PincodeValidation {
  pincode: string;
  isValid: boolean;
  district?: string;
  state?: string;
}

export default function PartnerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pincodes: "",
    phoneno: "", // Added phone number field
  });

  const [validatedPincodes, setValidatedPincodes] = useState<PincodeValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validatePincode = async (pincode: string): Promise<PincodeValidation> => {
    if (!/^\d{6}$/.test(pincode)) {
      return { pincode, isValid: false };
    }

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        return {
          pincode,
          isValid: true,
          district: postOffice.District,
          state: postOffice.State
        };
      }
      return { pincode, isValid: false };
    } catch {
      return { pincode, isValid: false };
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, pincodes: value });

    if (value) {
      setIsValidating(true);
      const pincodes = value.split(",").map(p => p.trim());
      const validations = await Promise.all(pincodes.map(validatePincode));
      setValidatedPincodes(validations);
      setIsValidating(false);
    } else {
      setValidatedPincodes([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validatedPincodes.some(p => !p.isValid)) {
      alert("Please fix invalid pincodes before submitting");
      return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(formData.phoneno)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const formattedData = {
      ...formData,
      pincodes: formData.pincodes.split(",").map(p => p.trim()),
    };

    try {
      const response = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = "./check-your-mail"; // Redirect to service selection page
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
      <div className="w-full max-w-3xl p-8 bg-white border border-gray-200 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Partner Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phoneno"
                pattern="[0-9]{10}"
                value={formData.phoneno}
                onChange={(e) => setFormData({ ...formData, phoneno: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pincodes</label>
            <input
              type="text"
              name="pincodes"
              placeholder="Enter comma-separated pincodes"
              value={formData.pincodes}
              onChange={handlePincodeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {isValidating && (
            <div className="text-blue-600">Validating pincodes...</div>
          )}

          {validatedPincodes.length > 0 && (
            <div className="space-y-2">
              {validatedPincodes.map((validation, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    validation.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span className="font-medium">{validation.pincode}</span>
                  {validation.isValid ? (
                    <span className="ml-2">
                      ✓ Valid ({validation.district}, {validation.state})
                    </span>
                  ) : (
                    <span className="ml-2">
                      ✗ Invalid pincode
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Register as Partner
          </button>
        </form>
      </div>
    </div>
  );
}