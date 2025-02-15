"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./provider";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";

function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Force the loader to stay for at least 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <Providers>
        <head>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body className="antialiased">
          {isLoading ? (
            <Loader />
          ) : (
            <CartProvider>
              <Toaster position="top-center" />
              {children}
            </CartProvider>
          )}
        </body>
      </Providers>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}