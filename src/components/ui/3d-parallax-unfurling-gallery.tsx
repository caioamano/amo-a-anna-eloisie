"use client";

/**
 * 3D Parallax Unfurling Gallery — 21st.dev
 * Adapted:
 *  - Uses the page scroll (the original nested its own overflow container,
 *    which would create a scroll-within-scroll trap).
 *  - Photos come from props; palette: espresso night with champagne frame.
 *  - `heading` is shown over the matrix while it unfurls.
 *  - On phones the 3D tilt is softened and only 3 columns render.
 */

import { useMemo, type ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import type { Photo as PhotoT } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { useLightbox } from "@/components/experience/lightbox";
import { useIsMobile } from "@/hooks/use-media";

const ImageCard = ({ photo }: { photo: PhotoT }) => {
  const open = useLightbox();
  return (
    <div
      className="backface-hidden preserve-3d relative h-[200px] w-full flex-shrink-0 cursor-pointer overflow-hidden bg-espresso transition-transform duration-300 will-change-transform hover:scale-[1.02] sm:h-[300px] md:h-[400px]"
      data-cursor="view"
      onClick={(e) => open(photo, e.currentTarget.getBoundingClientRect())}
    >
      <Photo photo={photo} className="opacity-80 transition-opacity duration-300 hover:opacity-100" />
    </div>
  );
};

export default function UnfurlingGallery({ images, heading }: { images: PhotoT[]; heading?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();

  const colMedia = useMemo(() => {
    const cols = [0, 1, 2, 3].map((c) => images.filter((_, i) => i % 4 === c));
    return cols.map((c) => [...c, ...c]);
  }, [images]);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20, mass: 0.5 });

  const bannerWidth = useTransform(smoothProgress, [0, 0.15], ["90vw", "100vw"]);
  const bannerHeight = useTransform(smoothProgress, [0, 0.15], ["80vh", "100vh"]);
  const bannerRadius = useTransform(smoothProgress, [0, 0.15], ["28px", "0px"]);
  const bannerBorderWidth = useTransform(smoothProgress, [0, 0.15], ["1px", "0px"]);

  const k = mobile ? 0.45 : 1;
  const rotateY = useTransform(smoothProgress, [0.15, 1], [-45 * k, -8 * k]);
  const rotateX = useTransform(smoothProgress, [0.15, 1], [25 * k, 4 * k]);
  const rotateZ = useTransform(smoothProgress, [0.15, 1], [15 * k, 2 * k]);
  const translateZ = useTransform(smoothProgress, [0.15, 1], [-800 * k, 0]);

  const yCols = [
    useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]),
    useTransform(smoothProgress, [0.15, 1], ["-40%", "10%"]),
    useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]),
    useTransform(smoothProgress, [0.15, 1], ["-30%", "20%"]),
  ];
  const headingOpacity = useTransform(smoothProgress, [0, 0.12, 0.3, 0.42], [0, 1, 1, 0]);
  const headingScale = useTransform(smoothProgress, [0, 0.42], [0.92, 1.08]);

  return (
    <section ref={containerRef} className="relative h-[350vh] w-full text-cream md:h-[420vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <motion.div
          style={{ width: bannerWidth, height: bannerHeight, borderRadius: bannerRadius, borderWidth: bannerBorderWidth, borderColor: "rgba(179,154,114,0.5)" }}
          className="backface-hidden preserve-3d relative mx-auto flex max-w-[1920px] items-center justify-center overflow-hidden bg-night/70 will-change-transform"
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ perspective: "1000px" }}>
            <div className="absolute inset-0 z-20 shadow-[inset_0_100px_150px_-50px_rgba(26,18,20,1),inset_0_-100px_150px_-50px_rgba(26,18,20,1)]" />
            <div className="absolute inset-0 z-20 shadow-[inset_150px_0_150px_-50px_rgba(26,18,20,1),inset_-150px_0_150px_-50px_rgba(26,18,20,1)]" />
            <motion.div
              style={{ rotateX, rotateY, rotateZ, z: translateZ, transformStyle: "preserve-3d" }}
              className="backface-hidden flex h-[150vh] w-[120vw] origin-center items-center justify-center gap-4 will-change-transform md:gap-6"
            >
              {colMedia.slice(0, mobile ? 3 : 4).map((col, c) => (
                <motion.div key={c} style={{ y: yCols[c] }} className="pointer-events-auto flex w-[30vw] min-w-[140px] flex-col gap-4 md:w-[22vw] md:min-w-[200px] md:gap-6">
                  {col.map((photo, index) => (
                    <ImageCard key={`col${c}-${index}`} photo={photo} />
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </div>
          {heading && (
            <motion.div style={{ opacity: headingOpacity, scale: headingScale }} className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6 text-center">
              {heading}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
