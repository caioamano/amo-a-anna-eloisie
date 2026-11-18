"use client";

/**
 * Scroll Choreography — 21st.dev
 * Adapted: palette, fallback-aware photos, responsive frame sizes, an overlay
 * caption that resolves on the final full-screen frame, and click-to-open.
 */

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Photo as PhotoT } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { useIsMobile } from "@/hooks/use-media";

interface ScrollChoreographyProps {
  className?: string;
  images: {
    topLeft: PhotoT;
    topRight: PhotoT;
    bottomLeft: PhotoT;
    bottomRight: PhotoT;
  };
  /** Rendered over the hero frame once it fills the screen. */
  children?: ReactNode;
}

export function ScrollChoreography({ className, images, children }: ScrollChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 50, mass: 1.2, restDelta: 0.001 });

  // frame size & offsets — taller frames on phones so photos stay readable
  const fw = mobile ? "42vw" : "30vw";
  const fh = mobile ? "26vh" : "32vh";
  const xLeft = mobile ? "-23vw" : "-17vw";
  const xRight = mobile ? "23vw" : "17vw";
  const yTop = mobile ? "-15vh" : "-18vh";
  const yBottom = mobile ? "15vh" : "18vh";

  const k = [0, 0.3, 0.35, 0.65, 1];
  const tlX = useTransform(smoothProgress, k, [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const tlY = useTransform(smoothProgress, k, [yTop, yBottom, yBottom, "0vh", "0vh"]);
  const brX = useTransform(smoothProgress, k, [xRight, xRight, xRight, "0vw", "0vw"]);
  const brY = useTransform(smoothProgress, k, [yBottom, yTop, yTop, "0vh", "0vh"]);
  const blX = useTransform(smoothProgress, k, [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const blY = useTransform(smoothProgress, k, [yBottom, yBottom, yBottom, "0vh", "0vh"]);
  const trX = useTransform(smoothProgress, k, [xRight, xRight, xRight, "0vw", "0vw"]);
  const trY = useTransform(smoothProgress, k, [yTop, yTop, yTop, "0vh", "0vh"]);

  // subtle editorial tilt that straightens as the stack aligns
  const tilt = useTransform(smoothProgress, [0, 0.35, 0.65], [-3, 3, 0]);

  const heroWidth = useTransform(smoothProgress, [0.65, 0.7, 0.9, 1], [fw, fw, "100vw", "100vw"]);
  const heroHeight = useTransform(smoothProgress, [0.65, 0.7, 0.9, 1], [fh, fh, "100vh", "100vh"]);
  const underImagesOpacity = useTransform(smoothProgress, [0.75, 0.85], [1, 0]);
  const captionOpacity = useTransform(smoothProgress, [0.88, 0.97], [0, 1]);
  const captionY = useTransform(smoothProgress, [0.88, 1], [40, 0]);
  const heroImgScale = useTransform(smoothProgress, [0.65, 1], [1.25, 1]);

  const baseImageClasses =
    "absolute left-1/2 top-1/2 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-beige shadow-[0_25px_60px_rgba(48,40,36,0.25)] will-change-transform";

  return (
    <div ref={containerRef} className={cn("relative h-[300vh] w-full", className)}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div style={{ x: tlX, y: tlY, rotate: tilt, opacity: underImagesOpacity, width: fw, height: fh }} className={cn(baseImageClasses, "z-10")}>
            <Photo photo={images.topLeft} />
          </motion.div>
          <motion.div style={{ x: brX, y: brY, opacity: underImagesOpacity, width: fw, height: fh }} className={cn(baseImageClasses, "z-20")}>
            <Photo photo={images.bottomRight} />
          </motion.div>
          <motion.div style={{ x: blX, y: blY, opacity: underImagesOpacity, width: fw, height: fh }} className={cn(baseImageClasses, "z-30")}>
            <Photo photo={images.bottomLeft} />
          </motion.div>
          <motion.div style={{ x: trX, y: trY, width: heroWidth, height: heroHeight }} className={cn(baseImageClasses, "z-40 origin-center")}>
            <motion.div className="h-full w-full" style={{ scale: heroImgScale }}>
              <Photo photo={images.topRight} />
            </motion.div>
            {children && (
              <motion.div
                className="absolute inset-0 flex items-end bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent p-6 md:p-16"
                style={{ opacity: captionOpacity, y: captionY }}
              >
                {children}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ScrollChoreography;
