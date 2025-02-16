"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LabelledInputProps {
  label: string;
  type: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LabelledInput({ label, type, name, onChange }: LabelledInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        onChange={onChange}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6"
        required
      />
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div className="space-y-6 rounded-md shadow-sm">
              <LabelledInput
                label="Full Name"
                type="text"
                name="name"
                onChange={handleChange}
              />
              <LabelledInput
                label="Email address"
                type="email"
                name="email"
                onChange={handleChange}
              />
              <LabelledInput
                label="Phone Number"
                type="text"
                name="phoneno"
                onChange={handleChange}
              />
              <LabelledInput
                label="Password"
                type="password"
                name="password"
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                onClick={handleSignup}
                className="group relative flex w-full justify-center rounded-md bg-black px-3 py-3 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Sign up
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-gray-900 hover:text-gray-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}