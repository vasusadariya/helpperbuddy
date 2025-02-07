"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold">Welcome to Helper Buddy</h1>

      {/* Show signup buttons only if the user is NOT logged in */}
      {!session ? (
        <>
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Signup
          </button>
          <button
            onClick={() => router.push("/partner/register")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Register for Partner
          </button>
        </>
      ) : (
        <>
          <p className="text-lg">Logged in as {session.user?.email}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
