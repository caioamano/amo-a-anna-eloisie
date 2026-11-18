"use client";

/**
 * Reveal Text — 21st.dev (GSAP SplitText)
 * Adapted: optional ScrollTrigger (play on enter, or scrub with scroll),
 * waits for fonts so lines split correctly, and reverts the split on cleanup.
 */

import { type ComponentProps, useMemo, useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type SplitType = "chars" | "words" | "lines";

type RevealTextProps = {
  type?: SplitType;
  gsapVars?: gsap.TweenVars;
  splitTextVars?: Partial<SplitText.Vars>;
  /** true → play when scrolled into view; object → custom ScrollTrigger (e.g. scrub). */
  scroll?: boolean | ScrollTrigger.Vars;
} & ComponentProps<"div">;

const defaultGsapVars: Record<SplitType, gsap.TweenVars> = {
  chars: { x: 150, opacity: 0, duration: 0.7, ease: "power3", stagger: 0.05 },
  words: { x: 150, opacity: 0, ease: "power3", duration: 1, stagger: 0.2, y: -100, rotation: "random(-80, 80)" },
  lines: { duration: 1, yPercent: 100, opacity: 0, stagger: 0.4, ease: "expo.out" },
};

export const RevealText = ({ type = "chars", gsapVars = {}, splitTextVars = {}, scroll, ...props }: RevealTextProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const splitType = useMemo(
    () => ({ chars: "chars,words,lines", words: "words,lines", lines: "lines" })[type],
    [type],
  );

  useGSAP(
    () => {
      const element = wrapperRef.current;
      if (!element) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let split: SplitText | undefined;
      let tween: gsap.core.Tween | undefined;
      let cancelled = false;

      const run = () => {
        if (cancelled) return;
        split = SplitText.create(element, { type: splitType, mask: type === "lines" ? "lines" : undefined, ...splitTextVars });
        const st =
          scroll === true
            ? { trigger: element, start: "top 82%", toggleActions: "play none none reverse" }
            : scroll
              ? { trigger: element, ...scroll }
              : undefined;
        tween = gsap.from(split[type], { ...defaultGsapVars[type], ...gsapVars, scrollTrigger: st });
      };
      if (document.fonts?.status === "loaded") run();
      else document.fonts.ready.then(run);

      return () => {
        cancelled = true;
        tween?.scrollTrigger?.kill();
        tween?.kill();
        split?.revert();
      };
    },
    { scope: wrapperRef },
  );

  return <div {...props} ref={wrapperRef} />;
};

export default RevealText;
