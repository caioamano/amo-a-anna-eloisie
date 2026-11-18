"use client";

/**
 * Scroll Morph Hero — 21st.dev
 * Adapted:
 *  - The original captured wheel/touch on its container and kept a "virtual"
 *    scroll value, which traps the page. Here the virtual value is derived from
 *    the real page scroll through a tall sticky container, so the visitor can
 *    always scroll past (and back).
 *  - The intro sequence (scatter → line → circle) starts when the scene enters view.
 *  - Images/texts are props; flip-card backs show the photo caption in the palette.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useScroll, useInView } from "framer-motion";
import type { Photo as PhotoT } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { useLightbox } from "@/components/experience/lightbox";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  photo: PhotoT;
  index: number;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({ photo, index, target }: FlipCardProps) {
  const open = useLightbox();
  return (
    <motion.div
      animate={{ x: target.x, y: target.y, rotate: target.rotation, scale: target.scale, opacity: target.opacity }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{ position: "absolute", width: IMG_WIDTH, height: IMG_HEIGHT, transformStyle: "preserve-3d", perspective: "1000px" }}
      className="group"
      data-cursor-label="Open"
      onClick={(e) => open(photo, (e.currentTarget as HTMLElement).getBoundingClientRect())}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-[3px] bg-beige shadow-lg" style={{ backfaceVisibility: "hidden" }}>
          <Photo photo={photo} alt={`${photo.alt} (${index + 1})`} />
          <div className="absolute inset-0 bg-espresso/10 transition-colors group-hover:bg-transparent" />
        </div>
        <div
          className="paper absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[3px] border border-champagne/40 p-1.5 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="mb-0.5 text-[6px] font-medium uppercase tracking-[0.2em] text-wine">No. {String(index + 1).padStart(2, "0")}</p>
          <p className="text-center font-serif text-[8px] italic leading-tight text-espresso">{photo.caption ?? "A little thing"}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const MAX_SCROLL = 3000;
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

interface IntroAnimationProps {
  images: PhotoT[];
  introText?: string;
  introHint?: string;
  title?: string;
  text?: string;
  /** Scroll length of the scene in viewport heights. */
  length?: number;
}

export default function IntroAnimation({
  images,
  introText = "The little things are everything.",
  introHint = "SCROLL TO EXPLORE",
  title = "Collected, one by one.",
  text,
  length = 3,
}: IntroAnimationProps) {
  const TOTAL_IMAGES = images.length;
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.4, once: true });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    return () => observer.disconnect();
  }, []);

  // --- Virtual scroll, driven by the real page scroll ---
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start", "end end"] });
  const virtualScroll = useTransform(scrollYProgress, [0, 1], [0, MAX_SCROLL]);

  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
  const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  // --- Mouse parallax ---
  const mouseX = useSpring(0, { stiffness: 30, damping: 20 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set((((e.clientX - rect.left) / rect.width) * 2 - 1) * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // --- Intro sequence, once visible ---
  useEffect(() => {
    if (!inView) return;
    const timer1 = setTimeout(() => setIntroPhase("line"), 300);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [inView]);

  const scatterPositions = useMemo(
    () =>
      images.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    [images],
  );

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);
  useEffect(() => {
    const a = smoothMorph.on("change", setMorphValue);
    const b = smoothScrollRotate.on("change", setRotateValue);
    const c = mouseX.on("change", setParallaxValue);
    return () => {
      a();
      b();
      c();
    };
  }, [smoothMorph, smoothScrollRotate, mouseX]);

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  return (
    <div ref={outerRef} className="relative" style={{ height: `${(length + 1) * 100}vh` }}>
      <div ref={containerRef} className="sticky top-0 h-screen w-full overflow-hidden bg-cream">
        <div className="perspective-1000 flex h-full w-full flex-col items-center justify-center">
          <div className="pointer-events-none absolute top-1/2 z-0 flex -translate-y-1/2 flex-col items-center justify-center px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 1 }}
              className="max-w-[12ch] font-display text-4xl italic text-espresso md:max-w-none md:text-6xl"
            >
              {introText}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.6 - morphValue } : { opacity: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="eyebrow mt-5 text-wine"
            >
              {introHint}
            </motion.p>
          </div>

          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="pointer-events-none absolute top-[11%] z-10 flex flex-col items-center justify-center px-6 text-center"
          >
            <p className="eyebrow mb-4 text-wine">Chapter 03 · The Little Things</p>
            <h3 className="mb-4 font-display text-5xl text-espresso md:text-7xl">{title}</h3>
            {text && <p className="max-w-lg font-sans text-sm leading-relaxed text-espresso/60 md:text-base">{text}</p>}
          </motion.div>

          <div className="relative flex h-full w-full items-center justify-center">
            {images.map((photo, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
              if (introPhase === "scatter") {
                target = scatterPositions[i];
              } else if (introPhase === "line") {
                const isMobileLine = containerSize.width < 768;
                const lineSpacing = isMobileLine ? 22 : 70;
                const lineX = i * lineSpacing - (TOTAL_IMAGES * lineSpacing) / 2;
                target = { x: lineX, y: 0, rotation: 0, scale: isMobileLine ? 0.7 : 1, opacity: 1 };
              } else {
                const isMobile = containerSize.width < 768;
                const minDimension = Math.min(containerSize.width, containerSize.height);
                const circleRadius = Math.min(minDimension * 0.35, 350);
                const circleAngle = (i / TOTAL_IMAGES) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = { x: Math.cos(circleRad) * circleRadius, y: Math.sin(circleRad) * circleRadius, rotation: circleAngle + 90 };

                const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
                const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                const arcCenterY = arcApexY + arcRadius;
                const spreadAngle = isMobile ? 100 : 130;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (TOTAL_IMAGES - 1);
                const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                const boundedRotation = -scrollProgress * spreadAngle * 0.8;
                const currentArcAngle = startAngle + i * step + boundedRotation;
                const arcRad = (currentArcAngle * Math.PI) / 180;
                const arcPos = {
                  x: Math.cos(arcRad) * arcRadius + parallaxValue,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: currentArcAngle + 90,
                  scale: isMobile ? 1.4 : 1.8,
                };
                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: 1,
                };
              }
              return <FlipCard key={i} photo={photo} index={i} target={target} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
