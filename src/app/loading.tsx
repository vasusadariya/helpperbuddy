"use client";

import dynamic from "next/dynamic";

const RiveWrapper = dynamic(() => import("@/components/ui/RiveWrapper"), {
  ssr: false, // Ensure it's only loaded on the client-side
});

export default function App() {
  return (
    <div className="App">
      <RiveWrapper />
    </div>
  );
}
