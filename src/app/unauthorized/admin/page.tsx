"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Unauthorized() {
    const [currentTime, setCurrentTime] = useState("2025-02-17 21:52:14");

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            const now = new Date();
            const formattedTime = now.toISOString().replace('T', ' ').split('.')[0];
            setCurrentTime(formattedTime);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px] animate-grid-fade pointer-events-none"></div>
            
            <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full text-center shadow-2xl border border-white/10">
                {/* Error Icon */}
                <div className="mb-6 relative">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full mx-auto flex items-center justify-center">
                        <svg 
                            className="w-12 h-12 text-red-500 animate-pulse" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    403 - Access Denied
                </h1>
                
                <div className="space-y-3 mb-8 text-gray-300">
                    <p className="text-lg">
                        You don't have permission to view this page.
                    </p>
                    <p className="text-sm opacity-75">
                        Please login as admin to access this resource.
                    </p>
                </div>

                {/* User Info */}
                <div className="mb-8 text-sm text-gray-400 bg-white/5 rounded-lg p-4">
                    <p>Time (UTC): <span className="font-mono text-yellow-400">{currentTime}</span></p>
                </div>

                {/* Action Button */}
                <Link 
                    href="/signin"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 group"
                >
                    <svg 
                        className="w-5 h-5 mr-2 group-hover:animate-bounce" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                        />
                    </svg>
                    Sign in as Admin
                </Link>
            </div>
        </div>
    );
}