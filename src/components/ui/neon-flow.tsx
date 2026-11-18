/**
 * Cursor Effects / Neon Flow (TubesBackground) — 21st.dev
 * Adapted: colours restricted to the ANNA ELOISIE palette (champagne,
 * dusty rose, burgundy, cream) so it reads as warm light rather than neon,
 * lower light intensity, and a graceful fallback if the CDN module fails.
 * It is loaded on demand only (mounted when its scene is visible, desktop).
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PALETTE = ["#B39A72", "#B98687", "#793D4A", "#E5D8C8", "#F4EFE6", "#C9A27E", "#9C5B66"];
const pickColors = (count: number) => Array.from({ length: count }, () => PALETTE[Math.floor(Math.random() * PALETTE.length)]);

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
  onFail?: () => void;
}

export function TubesBackground({ children, className, enableClickInteraction = true, onFail }: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tubesRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    const initTubes = async () => {
      if (!canvasRef.current) return;
      try {
        const url = "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";
        const module = await import(/* @vite-ignore */ url);
        const TubesCursor = module.default;
        if (!mounted || !canvasRef.current) return;
        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#B39A72", "#B98687", "#793D4A"],
            lights: { intensity: 120, colors: ["#F4EFE6", "#B98687", "#B39A72", "#E5D8C8"] },
          },
        });
        tubesRef.current = app;
        setIsLoaded(true);
      } catch (error) {
        console.warn("TubesCursor unavailable, using fallback.", error);
        onFail?.();
      }
    };
    initTubes();
    return () => {
      mounted = false;
      try {
        tubesRef.current?.dispose?.();
      } catch {
        /* library has no guaranteed dispose */
      }
      tubesRef.current = null;
    };
  }, [onFail]);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return;
    tubesRef.current.tubes.setColors(pickColors(3));
    tubesRef.current.tubes.setLightsColors(pickColors(4));
  };

  return (
    <div className={cn("relative h-full min-h-[400px] w-full overflow-hidden", className)} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 block h-full w-full transition-opacity duration-[1.5s]", isLoaded ? "opacity-100" : "opacity-0")}
        style={{ touchAction: "none" }}
      />
      <div className="pointer-events-none relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

export default TubesBackground;
