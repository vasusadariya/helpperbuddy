"use client";

import { useState, useEffect, JSX } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
interface UserProfile {
  id: string;
  email: string;
  phoneno: string;
  name: string;
}

interface ProfileFormData {
  phoneNo: string;
}

export default function ProfilePage(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>();

  useEffect(() => {
    const fetchUserProfile = async (): Promise<void> => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const userData = await response.json();
        setUser(userData);
        setValue("phoneNo", userData.phoneno);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    };

    void fetchUserProfile();
  }, [setValue]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo: data.phoneNo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update phone number");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Phone number updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update phone number");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold text-black mb-6">Profile Details</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {user && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <p className="mt-1 text-black font-medium">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="mt-1 text-black font-medium">{user.email}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label 
            htmlFor="phoneNo"
            className="block text-sm font-medium text-black mb-2"
          >
            Phone Number
          </label>
          <input
            id="phoneNo"
            type="tel"
            placeholder="Enter your 10-digit phone number"
            {...register("phoneNo", {
              required: "Phone number is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Please enter a valid 10-digit phone number",
              },
            })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 
                     focus:border-black focus:ring-1 focus:ring-black 
                     outline-none transition-colors bg-white text-black"
          />
          {errors.phoneNo && (
            <p className="mt-2 text-sm text-red-600">
              {errors.phoneNo.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-2 px-4 rounded-md 
                   hover:bg-gray-800 focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Updating...
            </span>
          ) : (
            "Update Phone Number"
          )}
        </button>
      </form>
    </div>
  );
}
