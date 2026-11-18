import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: "power3.out" });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Shared breakpoints for gsap.matchMedia() */
export const MQ = {
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
};

/**
 * Runs `fn` once web fonts are ready (so SplitText measures real glyphs).
 * Returns a cancel function — essential under React StrictMode, where the
 * first effect is cleaned up before the fonts promise resolves.
 */
export function whenFontsReady(fn: () => void) {
  let alive = true;
  const run = () => alive && fn();
  if (!document.fonts || document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);
  return () => {
    alive = false;
  };
}
