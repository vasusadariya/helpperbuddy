"use client";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export const RiveDemo = () => {
  const { RiveComponent } = useRive({
    src: "/loader_icon.riv",
    stateMachines: "State machine 1",
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });
  
  return (
    <div className="relative w-full h-full bg-black flex justify-center items-center">
      <RiveComponent className="w-full h-full brightness-125" />
    </div>
  );
};

export default function App() {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-1/2 h-1/2">
        <RiveDemo />
      </div>
    </div>
  );
}