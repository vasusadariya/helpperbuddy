"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Unauthorized() {
    const [currentTime, setCurrentTime] = useState("2025-02-17 21:56:18");

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-4">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:60px_60px] animate-grid-fade pointer-events-none"></div>
            
            <div className="relative bg-white/5 backdrop-blur-lg rounded-xl p-8 max-w-md w-full text-center shadow-2xl border border-white/10">
                {/* Error Icon */}
                <div className="mb-6 relative">
                    <div className="w-24 h-24 bg-gray-500/10 rounded-full mx-auto flex items-center justify-center">
                        <svg 
                            className="w-12 h-12 text-gray-400 animate-pulse" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    403 - User Access Required
                </h1>
                
                <div className="space-y-3 mb-8">
                    <p className="text-lg text-gray-300">
                        This area is restricted to registered users.
                    </p>
                    <p className="text-sm text-gray-400">
                        Please sign in with your user account to access this resource.
                    </p>
                </div>

                {/* System Info Card */}
                <div className="mb-8 text-sm text-gray-400 bg-black/40 rounded-lg p-4 border border-gray-800">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Time (UTC):</span>
                            <span className="font-mono text-gray-300">{currentTime}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-600">
                        User authentication required for access
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Link 
                        href="/signin"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-lg shadow-lg hover:from-gray-800 hover:to-black transform hover:scale-[1.02] transition-all duration-200 group border border-gray-700"
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
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                            />
                        </svg>
                        Sign in as User
                    </Link>

                    <Link 
                        href="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-white/5 text-gray-300 font-semibold rounded-lg hover:bg-white/10 transform hover:scale-[1.02] transition-all duration-200 border border-gray-800"
                    >
                        <svg 
                            className="w-5 h-5 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                            />
                        </svg>
                        Return to Home
                    </Link>
                </div>

                {/* Help Text */}
                <p className="mt-6 text-sm text-gray-500">
                    Don&#39;t have an account?{" "}
                    <Link 
                        href="/signup" 
                        className="text-gray-400 hover:text-white hover:underline transition-colors duration-200"
                    >
                        Create one now
                    </Link>
                </p>

                {/* Additional Info */}
                <div className="mt-8 text-xs text-gray-600 bg-black/20 rounded-lg p-3">
                    If you believe this is an error, please contact support.
                </div>
            </div>
        </div>
    );
}