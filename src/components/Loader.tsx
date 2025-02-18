"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

interface LoaderProps {
  size?: string;
}

export default function Loader({ size = "400px" }: LoaderProps) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <div className="w-full h-full">
          <div className="relative w-full h-full overflow-hidden">
            <div className="w-[calc(100%+20px)] -mx-2.5">
              <RiveComponent className="w-full h-full brightness-125" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}