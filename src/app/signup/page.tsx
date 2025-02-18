"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LabelledInputProps {
  label: string;
  type: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
}

function LabelledInput({ 
  label, 
  type, 
  name, 
  value = "", 
  onChange, 
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

export default function Signup() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneno: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setErrorMessage(errorText || "Signup failed.");
        return;
      }

      let data;
      try {
        data = await res.json();
        console.log("Signup response:", data);
      } catch (error) {
        console.error("Signup response is not JSON:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      <div className="flex min-h-screen items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-md space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl transform transition-all animate-fadeIn">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <h1 className="text-4xl font-bold text-black-600">HelperBuddy</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-600 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-500">Join us today</p>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 animate-shake">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div className="space-y-6">
              <LabelledInput
                label="Full Name"
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
              />
              <LabelledInput
                label="Email address"
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
              />
              <LabelledInput
                label="Phone Number"
                type="text"
                name="phoneno"
                value={userData.phoneno}
                onChange={handleChange}
              />
              <LabelledInput
                label="Password"
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                showPasswordToggle={true}
                isPasswordVisible={showPassword}
                onPasswordToggle={togglePasswordVisibility}
              />
            </div>

            <div>
              <button
                onClick={handleSignup}
                className="group relative flex w-full justify-center rounded-lg bg-black px-3 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02]"
              >
                Sign up
              </button>
            </div>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Already have an account?</span>
            </div>
          </div>

          <p className="text-center">
            <Link
              href="/signin"
              className="font-medium text-black hover:text-black-500 hover:underline transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}