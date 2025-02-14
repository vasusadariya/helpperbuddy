"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-black p-4 text-white flex items-center justify-between">
            {/* Logo & Brand Name */}
            <Link href="/" className="flex items-center space-x-2">
                <Image src="/logo.png" alt="Helper Buddy Logo" width={40} height={40} />
            </Link>

            {/* Authentication Buttons */}
            <div>
                {session?.user ? (
                    <button 
                        onClick={() => signOut()} 
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                    >
                        Logout
                    </button>
                ) : (
                    <Link 
                        href="/signin" 
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}

