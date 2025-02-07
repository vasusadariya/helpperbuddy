"use client";

import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-gray-800 p-4 text-white flex justify-between">
            <a href="/" className="text-lg font-bold">Helper Buddy</a>
            <div>
                {session?.user ? (
                    <button onClick={() => signOut()} className="bg-red-600 px-4 py-2 rounded-lg">Logout</button>
                ) : (
                    <a href="/signin" className="bg-blue-600 px-4 py-2 rounded-lg">Sign In</a>
                )}
            </div>
        </nav>
    );
}
