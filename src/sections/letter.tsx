import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { letter } from "@/content/letter";
import { letterIntro } from "@/content/story";
import { ChapterLabel } from "@/components/experience/chapter-label";
import { CinemaButton } from "@/components/experience/magnetic";
import { RevealText } from "@/components/ui/reveal-text";

/* ==========================================================================
   CHAPTER 06 — A LETTER FOR YOU
   A 3D envelope that leans toward the cursor. On click (GSAP timeline):
   the wax seal breaks, the flap opens in 3D, the letter rises out, the
   envelope falls away, the paper unfolds, the text writes itself in line by
   line, and the signature is drawn at the end.
   Text lives in src/content/letter.ts.
   ========================================================================== */

export const RELIVE_EVENT = "anna:relive";

// The sheet sits invisibly at its final width so SplitText can measure lines.
const SHEET_HIDDEN = { position: "absolute", left: 20, right: 20, top: 0, visibility: "hidden" } as const;

export function Letter() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const splitRef = useRef<SplitText | null>(null);
  const [opened, setOpened] = useState(false);

  // transition from the night of Chapter 05 into warm paper light
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.fromTo(q(".l-dusk"), { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top -20%", scrub: true } });

      // envelope leans toward the cursor
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const rx = gsap.quickTo(tilt.current, "rotateX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(tilt.current, "rotateY", { duration: 0.8, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = stage.current!.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 18);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 14);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      const s = stage.current!;
      s.addEventListener("pointermove", move);
      s.addEventListener("pointerleave", leave);
      return () => {
        s.removeEventListener("pointermove", move);
        s.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  const openLetter = () => {
    if (opened) return;
    setOpened(true);
    const q = gsap.utils.selector(root);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = SplitText.create(q(".l-body p, .l-greeting, .l-closing"), { type: "lines", mask: "lines" });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => ScrollTrigger.refresh(),
    });
    splitRef.current = lines;
    tlRef.current = tl;
    if (reduced) tl.timeScale(6);

    tl.to(q(".l-hint"), { opacity: 0, y: 10, duration: 0.4 })
      .to(tilt.current, { rotateX: 0, rotateY: 0, duration: 0.5 }, 0)
      .to(q(".l-seal"), { scale: 1.25, duration: 0.25, ease: "power2.out" }, 0.1)
      .to(q(".l-seal"), { scale: 0, rotate: 40, opacity: 0, duration: 0.45, ease: "back.in(2)" }, 0.35)
      .to(q(".l-flap"), { rotateX: 180, duration: 1.1 }, 0.6)
      .set(q(".l-flap"), { zIndex: 1 }, 1.15)
      .to(q(".l-card"), { yPercent: -78, duration: 1.1, ease: "power2.inOut" }, 1.4)
      .to(q(".l-env"), { y: "45vh", rotate: -6, opacity: 0, duration: 1.1, ease: "power3.in" }, 2.4)
      .to(q(".l-card"), { yPercent: -40, scale: 1.4, opacity: 0, duration: 0.8, ease: "power2.in" }, 2.5)
      .set(q(".l-stage-env"), { display: "none" })
      .set(q(".l-sheet"), { position: "relative", left: "auto", right: "auto", top: "auto", visibility: "visible" })
      .fromTo(q(".l-sheet"), { opacity: 0, scaleY: 0.06, scaleX: 0.7, rotateX: 60 }, { opacity: 1, scaleY: 1, scaleX: 1, rotateX: 0, duration: 1.4, ease: "expo.out" })
      .fromTo(q(".l-fold"), { opacity: 0.5 }, { opacity: 0.12, duration: 1.4 }, "<")
      .from(q(".l-date"), { opacity: 0, y: 10, duration: 0.5 }, "-=0.7")
      .from(lines.lines, { yPercent: 110, duration: 0.9, stagger: 0.12, ease: "power3.out" }, "-=0.3")
      .fromTo(q(".l-sign"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power2.inOut" })
      .from(q(".l-ornament"), { scaleX: 0, duration: 0.8 }, "-=0.6");
  };

  // reset when "Relive our story" is pressed
  useEffect(() => {
    const reset = () => {
      const tl = tlRef.current;
      if (!tl) return;
      tl.progress(0).kill();
      tlRef.current = null;
      splitRef.current?.revert();
      splitRef.current = null;
      const q = gsap.utils.selector(root);
      gsap.set(q(".l-stage-env"), { clearProps: "display" });
      gsap.set(q(".l-flap, .l-seal, .l-card, .l-env, .l-hint, .l-sign"), { clearProps: "all" });
      gsap.set(q(".l-sheet"), { clearProps: "transform,opacity", ...SHEET_HIDDEN });
      setOpened(false);
      ScrollTrigger.refresh();
    };
    window.addEventListener(RELIVE_EVENT, reset);
    return () => window.removeEventListener(RELIVE_EVENT, reset);
  }, []);

  return (
    <section ref={root} id="letter" className="relative overflow-hidden bg-cream pb-32" aria-label="Chapter 06 — A Letter For You">
      <div className="l-dusk pointer-events-none absolute inset-x-0 top-0 h-[90vh] bg-gradient-to-b from-night via-espresso to-cream" aria-hidden />

      <header className="relative z-10 px-6 pt-40 text-center md:pt-56">
        <ChapterLabel id="letter" className="mb-8 justify-center" />
        <RevealText
          type="chars"
          gsapVars={{ x: 0, y: 40, opacity: 0, filter: "blur(10px)", stagger: 0.04, duration: 1 }}
          scroll={{ start: "top 75%", toggleActions: "play none none reverse" }}
          className="font-display text-[clamp(3.4rem,10vw,10rem)] italic text-espresso"
        >
          {letterIntro.headline}
        </RevealText>
      </header>

      <div ref={stage} className="relative z-10 mx-auto flex min-h-[90svh] max-w-3xl items-center justify-center px-5">
        {/* ---------- envelope ---------- */}
        <div className="l-stage-env flex flex-col items-center gap-12">
          <div className="[perspective:1400px]">
            <div ref={tilt} className="[transform-style:preserve-3d]">
              <button
                type="button"
                onClick={openLetter}
                aria-label={letterIntro.cta}
                data-cursor-label="Open"
                className="l-env relative block aspect-[1.55] w-[min(86vw,540px)] outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-wine"
              >
                {/* back / inside */}
                <span className="absolute inset-0 rounded-[4px] bg-[#d9c7b2] shadow-[0_40px_80px_rgba(48,40,36,0.3),inset_0_0_60px_rgba(48,40,36,0.2)]" />
                {/* letter card peeking out */}
                <span className="l-card paper absolute inset-x-[6%] bottom-[6%] top-[6%] z-[2] flex flex-col items-center justify-center rounded-[2px] shadow-md">
                  <span className="font-serif text-2xl italic text-wine md:text-3xl">For Anna</span>
                  <span className="mt-3 block h-px w-16 bg-champagne/60" />
                </span>
                {/* front pocket */}
                <span
                  className="paper absolute inset-0 z-[3] rounded-[4px]"
                  style={{ clipPath: "polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)", boxShadow: "inset 0 -20px 40px rgba(121,61,74,0.08)" }}
                />
                <span
                  className="pointer-events-none absolute inset-0 z-[3]"
                  style={{ background: "linear-gradient(to top right, transparent 49.6%, rgba(48,40,36,0.08) 50%, transparent 50.4%), linear-gradient(to top left, transparent 49.6%, rgba(48,40,36,0.08) 50%, transparent 50.4%)" }}
                />
                {/* flap (two faces) */}
                <span className="l-flap absolute inset-x-0 top-0 z-[4] h-[58%] origin-top [transform-style:preserve-3d]">
                  <span
                    className="absolute inset-0 bg-[#efe5d6] [backface-visibility:hidden]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", filter: "drop-shadow(0 6px 8px rgba(48,40,36,.2))" }}
                  />
                  <span
                    className="absolute inset-0 bg-[#cdb9a1] [backface-visibility:hidden] [transform:rotateX(180deg)]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  />
                </span>
                {/* wax seal */}
                <span className="l-seal absolute left-1/2 top-[58%] z-[5] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-wine shadow-[0_6px_14px_rgba(48,40,36,0.4),inset_0_-4px_8px_rgba(0,0,0,0.25),inset_0_3px_6px_rgba(255,255,255,0.15)] md:h-20 md:w-20">
                  <span className="absolute inset-1.5 rounded-full border border-champagne/40" />
                  <span className="font-serif text-xl italic text-champagne md:text-2xl">AE</span>
                </span>
              </button>
            </div>
          </div>
          <div className="l-hint">
            <CinemaButton onClick={openLetter}>{letterIntro.cta}</CinemaButton>
          </div>
        </div>

        {/* ---------- unfolded letter ---------- */}
        <article
          style={SHEET_HIDDEN}
          className="l-sheet paper origin-center px-7 py-14 shadow-[0_50px_100px_rgba(48,40,36,0.25)] [transform-style:preserve-3d] md:px-16 md:py-20"
          aria-live="polite"
        >
          <span className="l-fold pointer-events-none absolute inset-x-0 top-1/3 h-px bg-espresso/30" aria-hidden />
          <span className="l-fold pointer-events-none absolute inset-x-0 top-2/3 h-px bg-espresso/30" aria-hidden />
          <span className="pointer-events-none absolute inset-3 border border-wine/15 md:inset-5" aria-hidden />
          <p className="l-date eyebrow mb-10 text-right text-wine/70">{letter.date}</p>
          <h3 className="l-greeting mb-8 font-serif text-3xl italic text-wine md:text-4xl">{letter.greeting}</h3>
          <div className="l-body space-y-6 font-serif text-xl leading-relaxed text-espresso md:text-[1.45rem]">
            {letter.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-14 text-right">
            <p className="l-closing font-serif text-xl italic text-espresso/80">{letter.closing}</p>
            <p className="l-sign mt-2 inline-block font-serif text-5xl italic text-wine md:text-6xl" style={{ clipPath: "inset(0% 100% 0% 0%)" }}>
              {letter.signature}
            </p>
            <span className="l-ornament mt-4 ml-auto block h-px w-32 origin-right bg-champagne" />
          </div>
        </article>
      </div>
    </section>
  );
}
