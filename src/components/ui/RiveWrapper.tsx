"use client";

import { useEffect, useState } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

const RiveWrapper = () => {
  const [isMounted, setIsMounted] = useState(false);

  const { RiveComponent } = useRive({
    src: "/loader_icon.riv", 
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false); // Cleanup on unmount
  }, []);

  if (!isMounted || !RiveComponent) return null; // Prevent abort error

  return <RiveComponent />;
};

export default RiveWrapper;
