import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP, whenFontsReady } from "@/lib/gsap";
import { photos, site } from "@/content/story";
import { CinemaButton } from "@/components/experience/magnetic";
import { Particles } from "@/components/experience/particles";
import { useSmoothScroll } from "@/components/experience/smooth-scroll";
import { useMusic } from "@/components/experience/audio";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

/* ==========================================================================
   CHAPTER 00 — THE INTRODUCTION
   Preloader curtain → monumental title → "Begin our story" cinematic wipe →
   Scroll Media Expansion Hero (21st.dev) carrying us into Chapter 01.
   ========================================================================== */

export function Introduction() {
  const root = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const { scrollTo, lenis } = useSmoothScroll();
  const music = useMusic();

  useGSAP(
    (context) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      if (reduced) {
        gsap.set(curtain.current, { autoAlpha: 0 });
        return;
      }

      let splits: SplitText[] = [];
      const build = () => {
        const first = SplitText.create(q(".intro-first"), { type: "chars", mask: "chars" });
        const last = SplitText.create(q(".intro-last"), { type: "chars" });
        splits = [first, last];

        // --- preloader & entrance ---
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        const counter = { v: 0 };
        tl.to(counter, {
          v: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => {
            const el = q(".pre-count")[0];
            if (el) el.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        })
          .to(q(".pre-line"), { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0)
          .to(q(".pre-mono"), { yPercent: -110, duration: 0.8, ease: "power3.in" }, 1.5)
          .to(q(".curtain-top"), { yPercent: -100, duration: 1.3, ease: "expo.inOut" }, 1.9)
          .to(q(".curtain-bottom"), { yPercent: 100, duration: 1.3, ease: "expo.inOut" }, 1.9)
          .set(curtain.current, { autoAlpha: 0 })
          .from(q(".intro-photo"), { clipPath: "inset(50% 50% 50% 50%)", scale: 1.25, duration: 2, ease: "expo.inOut" }, 2.1)
          .from(first.chars, { yPercent: 115, rotate: 6, duration: 1.6, stagger: 0.07 }, 2.5)
          .from(last.chars, { opacity: 0, filter: "blur(14px)", y: 30, duration: 1.4, stagger: 0.05, ease: "power3.out" }, 2.9)
          .from(q(".intro-rule"), { scaleX: 0, duration: 1.6, ease: "expo.inOut", stagger: 0.15 }, 2.7)
          .from(q(".intro-fade"), { opacity: 0, y: 16, duration: 1.2, stagger: 0.1 }, 3.3);

        // --- scroll-driven exit: the title drifts apart as we leave ---
        gsap
          .timeline({ scrollTrigger: { trigger: titleRef.current, start: "top top", end: "bottom top", scrub: true } })
          .to(q(".intro-first"), { xPercent: -18, yPercent: -30, ease: "none" }, 0)
          .to(q(".intro-last"), { xPercent: 22, yPercent: -10, ease: "none" }, 0)
          .to(q(".intro-photo"), { yPercent: 35, rotate: 4, scale: 0.9, ease: "none" }, 0)
          .to(q(".intro-meta"), { opacity: 0, ease: "none" }, 0)
          .to(q(".intro-stage"), { opacity: 0.2, ease: "none" }, 0.4);
      };
      const cancelFonts = whenFontsReady(() => context.add(build));
      return () => {
        cancelFonts();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root },
  );

  /** Begin our story: music + cinematic wipe + glide into the expanding photograph. */
  const begin = () => {
    if (busy) return;
    setBusy(true);
    music.start();
    const hero = document.getElementById("expansion-hero");
    const w = wipe.current!;
    const q = gsap.utils.selector(w);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !hero) {
      scrollTo(hero ?? "#beginning", { immediate: reduced });
      setBusy(false);
      return;
    }
    const top = hero.getBoundingClientRect().top + window.scrollY;
    gsap
      .timeline({ onComplete: () => setBusy(false) })
      .set(w, { autoAlpha: 1 })
      .fromTo(w, { clipPath: "circle(0% at 50% 62%)" }, { clipPath: "circle(150% at 50% 62%)", duration: 1.2, ease: "expo.inOut" })
      .fromTo(q(".wipe-line"), { opacity: 0, y: 30, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1 }, "-=0.35")
      .add(() => {
        lenis ? lenis.scrollTo(top, { immediate: true, force: true }) : window.scrollTo(0, top);
      })
      .to(q(".wipe-line"), { opacity: 0, y: -20, filter: "blur(8px)", duration: 0.8, ease: "power2.in" }, "+=0.9")
      .to(w, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2, ease: "expo.inOut" }, "-=0.2")
      .set(w, { autoAlpha: 0, clipPath: "none" })
      .add(() => scrollTo(top + hero.offsetHeight - window.innerHeight * 1.2, { duration: 4.2 }), "-=0.5");
  };

  return (
    <div id="introduction" ref={root}>
      {/* Preloader curtain */}
      <div ref={curtain} className="pointer-events-none fixed inset-0 z-[95]" aria-hidden>
        <div className="curtain-top absolute inset-x-0 top-0 h-1/2 bg-espresso" />
        <div className="curtain-bottom absolute inset-x-0 bottom-0 h-1/2 bg-espresso" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-cream">
          <div className="overflow-hidden">
            <div className="pre-mono font-serif text-6xl italic md:text-7xl">
              A<span className="text-champagne">&</span>E
            </div>
          </div>
          <div className="mt-6 flex w-48 items-center gap-4">
            <div className="relative h-px flex-1 bg-cream/15">
              <div className="pre-line absolute inset-0 origin-left scale-x-0 bg-champagne" />
            </div>
            <span className="pre-count eyebrow tabular-nums text-cream/70">000</span>
          </div>
        </div>
      </div>

      {/* Cinematic wipe used by "Begin our story" */}
      <div ref={wipe} className="invisible fixed inset-0 z-[94] flex items-center justify-center bg-wine px-8 text-center" aria-hidden>
        <p className="wipe-line max-w-3xl font-display text-4xl italic text-cream md:text-7xl">{site.opening}</p>
      </div>

      {/* Title screen */}
      <section ref={titleRef} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-cream" aria-label="Anna Eloisie — introduction">
        <Particles count={60} />
        {/* editorial grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto grid max-w-[1600px] grid-cols-4 px-6 md:grid-cols-12 md:px-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`border-l border-espresso/[0.05] ${i >= 4 ? "hidden md:block" : ""}`} />
          ))}
        </div>

        <div className="intro-stage relative mx-auto flex h-full max-w-[1600px] flex-col px-6 py-6 md:px-12 md:py-10">
          {/* top meta */}
          <header className="intro-meta intro-fade flex items-start justify-between text-espresso">
            <span className="font-serif text-2xl italic">
              A<span className="text-wine">·</span>E
            </span>
            <span className="eyebrow hidden text-espresso/60 sm:block">Vol. I — An immersive love story</span>
            <span className="eyebrow text-espresso/60">N° 001</span>
          </header>

          {/* monumental title */}
          <div className="relative flex flex-1 flex-col justify-center">
            <div
              className="intro-photo absolute right-[2%] top-[2%] aspect-[3/4] w-[30vw] max-w-[340px] md:top-1/2 md:-translate-y-[58%] overflow-hidden shadow-[0_30px_70px_rgba(48,40,36,0.25)] md:right-[14%] md:w-[22vw]"
              style={{ clipPath: "inset(0% 0% 0% 0%)" }}
            >
              <img src={photos.hero.fallback} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <img
                src={photos.hero.src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wine/40 to-transparent mix-blend-multiply" />
            </div>

            <div className="intro-rule mb-6 h-px w-full origin-left bg-espresso/20 md:mb-8" />
            <h1 className="relative z-10 text-espresso">
              <span className="intro-first block font-display text-[clamp(5.2rem,21vw,20rem)] tracking-[-0.045em]">Anna</span>
              <span className="intro-last -mt-[0.12em] block pl-[12vw] font-display text-[clamp(4.2rem,16vw,15.5rem)] italic text-wine md:pl-[22vw]">
                Eloisie
              </span>
            </h1>
            <div className="intro-rule mt-6 h-px w-full origin-right bg-espresso/20 md:mt-8" />

            <div className="mt-8 flex flex-col items-start justify-between gap-8 md:mt-10 md:flex-row md:items-end">
              <p className="intro-fade max-w-sm font-serif text-2xl italic leading-snug text-espresso/80 md:text-3xl">{site.concept}</p>
              <div className="intro-fade">
                <CinemaButton onClick={begin}>
                  {site.beginLabel}
                  <span aria-hidden className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </CinemaButton>
              </div>
            </div>
          </div>

          {/* scroll indicator */}
          <footer className="intro-meta intro-fade flex items-end justify-between text-espresso/60">
            <span aria-hidden />
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-10">
              <span className="eyebrow text-[0.6rem]">Scroll</span>
              <span className="relative block h-14 w-px overflow-hidden bg-espresso/10">
                <span className="scroll-drip absolute inset-0 bg-wine" />
              </span>
            </div>
            <span className="eyebrow">Chapter 00</span>
          </footer>
        </div>
      </section>

      {/* 21st.dev — Scroll Media Expansion Hero */}
      <div id="expansion-hero">
        <ScrollExpandMedia
          mediaType="image"
          media={photos.hero}
          bg={photos.heroBg}
          title={`${site.firstName} ${site.lastName}`}
          date={site.opening}
          scrollToExpand="Scroll to enter"
          length={2.2}
          overlay={
            <div className="flex h-full flex-col items-center justify-center px-6 text-center text-cream">
              <p className="eyebrow mb-6 text-champagne">A story written by us</p>
              <p className="max-w-4xl font-display text-5xl italic md:text-8xl">{site.opening}</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
