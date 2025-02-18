"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export const RiveDemo = () => {
  const { RiveComponent } = useRive({
    src: "/loader_icon.riv",
    stateMachines: "State machine 1",
    layout: new Layout({
      fit: Fit.Fill,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  return (
    <div
      className="relative w-full h-full flex justify-center items-center"
      style={{
        boxSizing: "border-box",
        overflow: "hidden",
        width: "300px",
        height: "300px",
      }}
    >
      <RiveComponent className="w-full h-full brightness-125" />
    </div>
  );
};

export default function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="w-[300px] h-[300px] flex justify-center items-center"> {/* Fixed width and height */}
        <RiveDemo />
      </div>
    </div>
  );
}