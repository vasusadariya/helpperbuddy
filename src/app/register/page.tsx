'use client';
import React, { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface PincodeValidation {
  pincode: string;
  isValid: boolean;
  district?: string;
  state?: string;
}

interface LabelledInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: string;
  placeholder?: string;
}

function LabelledInput({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  pattern, 
  placeholder 
}: LabelledInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        pattern={pattern}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
        required
      />
    </div>
  );
}

export default function PartnerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pincodes: "",
    phoneno: "",
  });
  const [validatedPincodes, setValidatedPincodes] = useState<PincodeValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const validatePincode = async (pincode: string): Promise<PincodeValidation> => {
    if (!/^\d{6}$/.test(pincode)) {
      return { pincode, isValid: false };
    }

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data[0]?.Status === "Success") {
        const postOffice = data[0].PostOffice?.[0];
        return postOffice
          ? {
              pincode,
              isValid: true,
              district: postOffice.District,
              state: postOffice.State,
            }
          : { pincode, isValid: false };
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
      const pincodes = value
        .split(",")
        .map(p => p.trim())
        .filter(p => /^\d{6}$/.test(p));

      const validations = await Promise.all(pincodes.map(validatePincode));
      setValidatedPincodes(validations);
      setIsValidating(false);
    } else {
      setValidatedPincodes([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (validatedPincodes.some(p => !p.isValid)) {
      setError("Please fix invalid pincodes before submitting");
      return;
    }

    if (!/^\d{10}$/.test(formData.phoneno)) {
      setError("Please enter a valid 10-digit phone number");
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
        window.location.href = "./check-your-mail";
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                Partner Registration
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Join our network of service providers
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <LabelledInput
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
                
                <LabelledInput
                  label="Email address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                />

                <LabelledInput
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter a strong password"
                />

                <LabelledInput
                  label="Phone Number"
                  type="tel"
                  name="phoneno"
                  pattern="[0-9]{10}"
                  value={formData.phoneno}
                  onChange={(e) => setFormData({ ...formData, phoneno: e.target.value })}
                  placeholder="10-digit mobile number"
                />

                <div className="space-y-2">
                  <LabelledInput
                    label="Service Areas (Pincodes)"
                    type="text"
                    name="pincodes"
                    value={formData.pincodes}
                    onChange={handlePincodeChange}
                    placeholder="Enter comma-separated pincodes, e.g. 400001, 400002"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the pincodes of areas where you'll provide services, separated by commas
                  </p>
                </div>
              </div>

              {isValidating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validating pincodes...</span>
                </div>
              )}

              {validatedPincodes.length > 0 && (
                <div className="space-y-2">
                  {validatedPincodes.map((validation, index) => (
                    <div
                      key={index}
                      className={`flex items-center rounded-lg p-3 text-sm ${
                        validation.isValid 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
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

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Register as Partner
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already registered?{" "}
              <Link
                href="/signin"
                className="font-medium text-gray-900 hover:text-gray-700 hover:underline"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}