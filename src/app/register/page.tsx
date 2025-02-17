"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface PincodeValidation {
  pincode: string;
  isValid: boolean;
  district?: string;
  state?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

interface LabelledInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: string;
  placeholder?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
}

function ConfirmationModal({ isOpen, onClose, message }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Registration Successful
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full rounded-lg bg-black px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelledInput({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  pattern, 
  placeholder,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onPasswordToggle 
}: LabelledInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswordToggle && isPasswordVisible ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          pattern={pattern}
          placeholder={placeholder}
          className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black-600 sm:text-sm transition-all duration-200"
          required
        />
        {showPasswordToggle && value.length > 0 && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-opacity duration-200"
          >
            {isPasswordVisible ? (
              <svg
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        )}
      </div>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleModalClose = () => {
    setShowModal(false);
    window.location.href = "/"; // Redirect to homepage
  };

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
        // Instead of redirecting, show the modal
        setShowModal(true);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong!");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative">
      <ConfirmationModal
        isOpen={showModal}
        onClose={handleModalClose}
        message="You will get a confirmation mail, once you are approved"
      />
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      <div className="flex min-h-screen items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-xl space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl transform transition-all animate-fadeIn">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <h1 className="text-4xl font-bold text-black-600">HelperBuddy</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-600 mb-2">
              Partner Registration
            </h2>
            <p className="text-sm text-gray-500">
              Join our network of service providers
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 animate-shake">
              <p className="text-sm text-red-800">{error}</p>
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
                showPasswordToggle={true}
                isPasswordVisible={showPassword}
                onPasswordToggle={() => setShowPassword(!showPassword)}
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

              <div>
                <LabelledInput
                  label="Service Areas (Pincodes)"
                  type="text"
                  name="pincodes"
                  value={formData.pincodes}
                  onChange={handlePincodeChange}
                  placeholder="Enter comma-separated pincodes, e.g. 400001, 400002"
                />
                <p className="mt-2 text-xs text-gray-500">
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

            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg bg-black px-3 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02]"
            >
              Register as Partner
            </button>
          </form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Already registered?</span>
            </div>
          </div>

          <p className="text-center">
            <Link
              href="/signin"
              className="font-medium text-black hover:text-black-500 hover:underline transition-colors duration-200"
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}