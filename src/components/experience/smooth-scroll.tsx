import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type ScrollApi = {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, opts?: { duration?: number; offset?: number; immediate?: boolean }) => void;
};

const ScrollContext = createContext<ScrollApi>({ lenis: null, scrollTo: () => {} });
export const useSmoothScroll = () => useContext(ScrollContext);

/**
 * Single smooth-scroll system: Lenis drives window scrolling and is ticked by
 * GSAP's ticker, so ScrollTrigger and Framer Motion's useScroll both read the
 * same native scroll position (no competing listeners, no scroll hijacking).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 1.1, smoothWheel: true, syncTouch: false });
    lenisRef.current = l;
    setLenis(l);
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Recalculate every trigger once fonts & images have settled.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 1500);
    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
    };
  }, []);

  const scrollTo: ScrollApi["scrollTo"] = (target, opts = {}) => {
    const l = lenisRef.current;
    if (l) {
      l.scrollTo(target as never, {
        duration: opts.duration ?? 2.2,
        offset: opts.offset ?? 0,
        immediate: opts.immediate,
        easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        force: true,
      });
      return;
    }
    const y =
      typeof target === "number"
        ? target
        : (typeof target === "string" ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect().top! + window.scrollY;
    window.scrollTo({ top: y + (opts.offset ?? 0), behavior: opts.immediate ? "auto" : "smooth" });
  };

  return <ScrollContext.Provider value={{ lenis, scrollTo }}>{children}</ScrollContext.Provider>;
}
