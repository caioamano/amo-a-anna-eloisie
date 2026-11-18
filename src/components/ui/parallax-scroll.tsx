"use client";

/**
 * Parallax Grid Scroll — 21st.dev (ParallaxScrollSecond)
 * Adapted: the original scrolled inside a fixed-height inner container. In a
 * narrative page that creates a "scroll trap", so the grid now reacts to the
 * page scroll. next/image → fallback-aware <img>; palette; click-to-open.
 */

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { Photo as PhotoT } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { useLightbox } from "@/components/experience/lightbox";

export const ParallaxScrollSecond = ({ images, className }: { images: PhotoT[]; className?: string }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const open = useLightbox();
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ["start end", "end start"] });

  const translateYFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateXFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const rotateXFirst = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const translateYThird = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateXThird = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotateXThird = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const translateYSecond = useTransform(scrollYProgress, [0, 1], [120, -120]);

  const third = Math.ceil(images.length / 3);
  const parts = [images.slice(0, third), images.slice(third, 2 * third), images.slice(2 * third)];
  const styles = [
    { y: translateYFirst, x: translateXFirst, rotateZ: rotateXFirst },
    { y: translateYSecond },
    { y: translateYThird, x: translateXThird, rotateZ: rotateXThird },
  ];

  const Card = ({ photo, idx }: { photo: PhotoT; idx: number }) => (
    <figure
      className="group relative m-0 overflow-hidden rounded-[2px] bg-beige"
      data-cursor="view"
      onClick={(e) => open(photo, e.currentTarget.getBoundingClientRect())}
    >
      <Photo
        photo={photo}
        className={cn("w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105", idx % 2 ? "h-80" : "h-96")}
      />
      <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-espresso/70 to-transparent p-4 font-serif text-lg italic text-cream transition-transform duration-500 group-hover:translate-y-0">
        {photo.caption}
      </figcaption>
    </figure>
  );

  return (
    <div className={cn("w-full items-start overflow-x-clip", className)} ref={gridRef}>
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 px-6 py-24 md:grid-cols-2 md:px-10 lg:grid-cols-3">
        {parts.map((part, col) => (
          <div key={col} className={cn("grid gap-10", col === 1 && "hidden md:grid", col === 2 && "hidden lg:grid")}>
            {part.map((photo, idx) => (
              <motion.div style={styles[col]} key={`grid-${col}-${idx}`}>
                <Card photo={photo} idx={idx + col} />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParallaxScrollSecond;
