"use client";

/**
 * Scroll Media Expansion Hero — 21st.dev
 * --------------------------------------------------------------------------
 * Adapted for ANNA ELOISIE:
 *  - The original hijacked the wheel/touch events and forced window.scrollTo(0,0)
 *    until the media expanded. That blocks natural scrolling and fights Lenis,
 *    so the progress now comes from a tall sticky container (useScroll). The
 *    visual behaviour — media growing, title halves sliding apart, background
 *    fading, content revealing — is preserved, and scrolling back reverses it.
 *  - next/image replaced by a fallback-aware <img> (Vite project).
 *  - Palette, typography and copy follow the project identity.
 */

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { Photo as PhotoT } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { cn } from "@/lib/utils";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  /** Image photo object (for mediaType image) */
  media?: PhotoT;
  /** Video URL (for mediaType video) */
  mediaSrc?: string;
  posterSrc?: string;
  bg: PhotoT;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  /** Scroll distance of the expansion, in viewport heights. */
  length?: number;
  /** Overlay rendered on top of the fully-expanded media. */
  overlay?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const ScrollExpandMedia = ({
  mediaType = "image",
  media,
  mediaSrc,
  posterSrc,
  bg,
  title,
  date,
  scrollToExpand,
  textBlend,
  length = 2.6,
  overlay,
  children,
  className,
}: ScrollExpandMediaProps) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 0.78], [0, 1], { clamp: true });
  const p = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.4, restDelta: 0.0005 });

  // media grows from a small card to a full-bleed frame
  const width = useTransform(p, (v) => `calc(min(300px, 70vw) + (100vw - min(300px, 70vw)) * ${v})`);
  const height = useTransform(p, (v) => `calc(min(400px, 52dvh) + (100dvh - min(400px, 52dvh)) * ${v})`);
  const radius = useTransform(p, [0, 0.9, 1], [10, 4, 0]);
  const bgOpacity = useTransform(p, [0, 1], [1, 0]);
  const bgScale = useTransform(p, [0, 1], [1.08, 1.25]);
  const mediaScale = useTransform(p, [0, 1], [1.35, 1]);
  const veil = useTransform(p, [0, 1], [0.45, 0.18]);
  const leftX = useTransform(p, (v) => `${-v * 60}vw`);
  const rightX = useTransform(p, (v) => `${v * 60}vw`);
  const titleOpacity = useTransform(p, [0.55, 0.85], [1, 0]);
  const overlayOpacity = useTransform(p, [0.86, 1], [0, 1]);
  const overlayY = useTransform(p, [0.86, 1], [30, 0]);

  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <div ref={sectionRef} className={cn("relative", className)} style={{ height: `${length * 100 + 100}dvh` }}>
      <section className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-cream">
        {/* background photograph */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: bgOpacity }}>
          <motion.div className="h-full w-full" style={{ scale: bgScale }}>
            <Photo photo={bg} eager alt="" className="h-full w-full" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/35 to-cream/80" />
        </motion.div>

        {/* expanding media */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{ width, height, borderRadius: radius, boxShadow: "0 30px 80px rgba(48,40,36,0.28)" }}
        >
          <motion.div className="h-full w-full" style={{ scale: mediaScale }}>
            {mediaType === "video" && mediaSrc ? (
              <video
                src={mediaSrc}
                poster={posterSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
              />
            ) : (
              media && <Photo photo={media} eager className="h-full w-full" />
            )}
          </motion.div>
          <motion.div className="absolute inset-0 bg-espresso" style={{ opacity: veil }} />
          {overlay && (
            <motion.div className="absolute inset-0 z-10" style={{ opacity: overlayOpacity, y: overlayY }}>
              {overlay}
            </motion.div>
          )}
        </motion.div>

        {/* caption lines travelling apart */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex w-full -translate-x-1/2 translate-y-[min(230px,30dvh)] flex-col items-center gap-1 text-center">
          {date && (
            <motion.p className="font-serif text-lg italic text-espresso md:text-2xl" style={{ x: leftX, opacity: titleOpacity }}>
              {date}
            </motion.p>
          )}
          {scrollToExpand && (
            <motion.p className="eyebrow text-wine" style={{ x: rightX, opacity: titleOpacity }}>
              {scrollToExpand}
            </motion.p>
          )}
        </div>

        {/* title halves */}
        <div
          className={cn(
            "pointer-events-none relative z-20 flex w-full flex-col items-center justify-center gap-1 text-center",
            textBlend ? "mix-blend-difference" : "mix-blend-normal",
          )}
        >
          <motion.h2
            className={cn("font-display text-[clamp(3.2rem,11vw,10rem)] italic", textBlend ? "text-cream" : "text-espresso")}
            style={{ x: leftX, opacity: titleOpacity }}
          >
            {firstWord}
          </motion.h2>
          <motion.h2
            className={cn("font-display text-[clamp(3.2rem,11vw,10rem)]", textBlend ? "text-cream" : "text-wine")}
            style={{ x: rightX, opacity: titleOpacity }}
          >
            {restOfTitle}
          </motion.h2>
        </div>
      </section>

      {children && (
        <motion.section
          className="relative z-10 flex w-full flex-col px-8 py-10 md:px-16 lg:py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          {children}
        </motion.section>
      )}
    </div>
  );
};

export default ScrollExpandMedia;
