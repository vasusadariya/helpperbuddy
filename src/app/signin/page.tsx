"use client";

import { signIn, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default function SignIn() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkPartnerServices = async () => {
      try {
        const response = await fetch('/api/partner/services');
        
        if (!response.ok) {
          if (response.status === 404) {
            // Partner not found or no services
            router.push("/partner/service-selection");
            return;
          }
          throw new Error('Failed to fetch services');
        }
        
        const partnerServices = await response.json();
        
        // If partner has no services, redirect to service selection
        if (!partnerServices || partnerServices.length === 0) {
          router.push("/partner/service-selection");
        } else {
          router.push("/partner/dashboard");
        }
      } catch (error) {
        console.error("Error checking partner services:", error);
        // In case of error, we'll redirect to service selection to be safe
        router.push("/partner/service-selection");
      }
    };

    if (session?.user?.role) {
      if (session.user.role === "USER") {
        router.push("/user/dashboard");
      } else if (session.user.role === "PARTNER") {
        checkPartnerServices();
      } else if (session.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      }
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div>
      <div className="h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <LabelledInput label="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
            <LabelledInput label="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">Sign In</button>
          </form>
          <button
            onClick={() => signIn("google")}
            className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
          >
            Sign in with Google
          </button>
          <p className="pt-5">Don&apos;t have an account?{" "} <Link href="/signup" className="text-blue-600 hover:underline">
             Sign up
          </Link></p>
        </div>
      </div>
    </div>
  );
}

interface LabelledInputProps {
  label: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LabelledInput({ label, type, onChange }: LabelledInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
        required
      />
    </div>
  );
}