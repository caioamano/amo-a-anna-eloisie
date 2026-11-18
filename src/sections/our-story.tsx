import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ, whenFontsReady } from "@/lib/gsap";
import { timeline } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { ChapterLabel } from "@/components/experience/chapter-label";
import { useLightbox } from "@/components/experience/lightbox";
import { RevealText } from "@/components/ui/reveal-text";
import { cn } from "@/lib/utils";

/* ==========================================================================
   CHAPTER 02 — OUR STORY
   Desktop: a pinned horizontal timeline driven by ScrollTrigger
   (containerAnimation). A hand-drawn thread connects every memory and draws
   itself with the scroll; dates type in, photos unmask, numbers parallax.
   Mobile: the same content as a vertical story with a growing thread.
   ========================================================================== */

export function OurStory() {
  const root = useRef<HTMLElement>(null);
  const open = useLightbox();

  useGSAP(
    (context) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const splits: SplitText[] = [];

      const build = () => {
        q(".t-date").forEach((el) => splits.push(SplitText.create(el, { type: "chars" })));

        mm.add(MQ.desktop, () => {
          const track = q(".t-track")[0] as HTMLElement;
          const distance = () => track.scrollWidth - window.innerWidth;
          const path = q(".t-path")[0] as unknown as SVGPathElement;
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

          const scroller = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: q(".t-pin")[0],
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
          const st = { containerAnimation: scroller, scrub: true };

          gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: track, containerAnimation: scroller, start: "left left", end: "right right", scrub: true } });
          gsap.to(q(".t-bar"), { scaleX: 1, ease: "none", scrollTrigger: { trigger: track, containerAnimation: scroller, start: "left left", end: "right right", scrub: true } });

          q(".t-entry").forEach((entry, i) => {
            const e = gsap.utils.selector(entry);
            const tl = gsap.timeline({ scrollTrigger: { ...st, trigger: entry, start: "left 85%", end: "left 35%" } });
            tl.fromTo(e(".t-photo"), { clipPath: i % 2 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out" }, 0)
              .fromTo(e(".t-photo-img"), { scale: 1.4 }, { scale: 1, ease: "power2.out" }, 0)
              .from(e(".t-date .char, .t-date div"), { opacity: 0, yPercent: 60, stagger: 0.03 }, 0.1)
              .from(e(".t-title, .t-text"), { opacity: 0, y: 30, stagger: 0.1 }, 0.25)
              .from(e(".t-dot"), { scale: 0, ease: "back.out(3)" }, 0.2);
            gsap.fromTo(e(".t-num"), { xPercent: 40 }, { xPercent: -40, ease: "none", scrollTrigger: { ...st, trigger: entry, start: "left right", end: "right left" } });
          });
        });

        mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
          gsap.set(q(".t-pin"), { overflowX: "auto" });
        });

        mm.add(MQ.mobile, () => {
          gsap.fromTo(q(".t-vline"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: q(".t-track")[0], start: "top 60%", end: "bottom 60%", scrub: true } });
          q(".t-entry").forEach((entry) => {
            const e = gsap.utils.selector(entry);
            gsap
              .timeline({ scrollTrigger: { trigger: entry, start: "top 80%", end: "top 30%", scrub: 1 } })
              .fromTo(e(".t-photo"), { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
              .fromTo(e(".t-photo-img"), { scale: 1.35 }, { scale: 1 }, 0)
              .from(e(".t-date div"), { opacity: 0, yPercent: 60, stagger: 0.03 }, 0)
              .from(e(".t-title, .t-text"), { opacity: 0, y: 24, stagger: 0.1 }, 0.2);
          });
        });
      };
      const cancelFonts = whenFontsReady(() => context.add(build));
      return () => {
        cancelFonts();
        mm.revert();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root },
  );

  const n = timeline.entries.length;
  // gentle wave connecting all entries (viewBox scaled to the track)
  const W = 1000 * (n + 1);
  const d = Array.from({ length: n + 1 }, (_, i) => {
    const x = 500 + i * 1000;
    const y = i % 2 ? 320 : 180;
    return i === 0 ? `M0 250 C 250 250, 300 ${y}, ${x} ${y}` : `S ${x - 500} ${y}, ${x} ${y}`;
  }).join(" ");

  return (
    <section ref={root} id="our-story" className="relative bg-cream" aria-label="Chapter 02 — Our Story">
      <header className="relative mx-auto max-w-[1600px] px-6 pb-16 pt-32 md:px-12 md:pb-24 md:pt-48">
        <ChapterLabel id="our-story" className="mb-8" />
        <RevealText
          type="lines"
          scroll={{ start: "top 85%", toggleActions: "play none none reverse" }}
          className="max-w-[14ch] font-display text-[clamp(3rem,8vw,8rem)] text-espresso"
        >
          {timeline.headline}
        </RevealText>
        <p className="mt-8 max-w-md font-sans text-sm leading-relaxed text-espresso/60">
          A thread of moments. <span className="text-wine">[ Every date and description below is a placeholder — edit them in src/content/story.ts ]</span>
        </p>
      </header>

      <div className="t-pin relative md:h-[100svh] md:overflow-hidden">
        <div className="t-track relative flex flex-col gap-24 px-6 pb-32 md:h-full md:w-max md:flex-row md:items-center md:gap-0 md:px-0 md:pb-0">
          {/* desktop thread */}
          <svg className="pointer-events-none absolute left-0 top-1/2 hidden h-[500px] -translate-y-1/2 md:block" style={{ width: "100%" }} viewBox={`0 0 ${W} 500`} preserveAspectRatio="none" aria-hidden>
            <path d={d} fill="none" stroke="#793D4A" strokeOpacity="0.12" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <path className="t-path" d={d} fill="none" stroke="#793D4A" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* mobile thread */}
          <div className="absolute bottom-32 left-[34px] top-0 w-px bg-wine/15 md:hidden" aria-hidden>
            <div className="t-vline h-full w-full origin-top bg-wine" />
          </div>

          <div className="hidden w-[30vw] shrink-0 md:block" aria-hidden />

          {timeline.entries.map((e, i) => (
            <article
              key={i}
              className={cn(
                "t-entry relative flex shrink-0 flex-col pl-14 md:w-[50vw] md:max-w-[760px] md:flex-row md:items-center md:gap-10 md:pl-0 lg:w-[42vw]",
                i % 2 ? "md:translate-y-[9vh] md:flex-row-reverse" : "md:-translate-y-[9vh]",
              )}
            >
              <span className="t-dot absolute left-[29px] top-2 h-[11px] w-[11px] rounded-full border-2 border-cream bg-wine md:hidden" aria-hidden />
              <span
                className="t-num text-outline pointer-events-none absolute -top-16 right-0 font-display text-[9rem] text-wine/30 md:-top-24 md:text-[16rem]"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <figure
                className="t-photo relative m-0 aspect-[4/5] w-full max-w-[420px] overflow-hidden bg-beige shadow-[0_30px_60px_rgba(48,40,36,0.18)] md:w-[46%]"
                data-cursor="view"
                onClick={(ev) => open(e.photo, ev.currentTarget.getBoundingClientRect())}
              >
                <div className="t-photo-img h-full w-full">
                  <Photo photo={e.photo} />
                </div>
              </figure>
              <div className="relative mt-6 md:mt-0 md:w-[54%]">
                <span className="t-dot absolute -left-8 top-3 hidden h-3 w-3 rounded-full bg-wine ring-8 ring-wine/10 md:block" aria-hidden />
                <div className="t-date eyebrow mb-4 text-wine">{e.date}</div>
                <h3 className="t-title font-display text-4xl text-espresso md:text-6xl">{e.title}</h3>
                <p className="t-text mt-4 max-w-sm font-sans text-sm leading-relaxed text-espresso/60">{e.text}</p>
              </div>
            </article>
          ))}

          <div className="hidden w-[20vw] shrink-0 md:block" aria-hidden />
        </div>

        <div className="absolute bottom-10 left-12 right-12 hidden items-center gap-6 md:flex">
          <span className="eyebrow text-espresso/50">Then</span>
          <div className="relative h-px flex-1 bg-espresso/10">
            <div className="t-bar absolute inset-0 origin-left scale-x-0 bg-wine" />
          </div>
          <span className="eyebrow text-espresso/50">Now</span>
        </div>
      </div>
    </section>
  );
}
