"use client";

import { useEffect, useState, useRef } from "react";

interface LoaderProps {
  size?: string;
}

export default function Loader({ size = "400px" }: LoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
      });
    }

    const minDisplayTime = setTimeout(() => {
      setIsFading(true); // Start fade out
      setTimeout(() => {
        setIsVisible(false); // Remove from DOM after fade
      }, 500); // Match this with CSS animation duration
    }, 3500);

    return () => {
      clearTimeout(minDisplayTime);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <div style={{ width: size, height: size }} className="flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="max-w-full max-h-full object-contain"
          onError={(e) => console.error("Video error:", e)}
        >
          <source src="/Loader.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}