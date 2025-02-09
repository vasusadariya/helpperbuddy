"use client";

import { signIn, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

  if (session?.user?.role) {
    if (session.user.role === "USER") {
      router.push("/user/dashboard");
    } else if (session.user.role === "PARTNER") {
      router.push("/partner/dashboard");
    } else if (session.user.role === "ADMIN") {
      router.push("/admin/approvals");
    }
  }

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
        </div>
      </div>
    </div>
  );
}

function LabelledInput({ label, type, onChange }: { label: string; type: string; onChange: (e: any) => void }) {
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

