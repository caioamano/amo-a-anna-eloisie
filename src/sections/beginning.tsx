import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ, whenFontsReady } from "@/lib/gsap";
import { beginning } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { ChapterLabel } from "@/components/experience/chapter-label";
import { ScrollChoreography } from "@/components/ui/scroll-choreography";

/* ==========================================================================
   CHAPTER 01 — THE BEGINNING
   A pinned, scrubbed opening-titles sequence: the headline assembles, photos
   slide in from three directions at different speeds, a masked photograph
   opens to full-screen with a progressive zoom, and lines replace each other
   over it. Followed by the Scroll Choreography (21st.dev) stack.
   ========================================================================== */

export function Beginning() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (context) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      let split: SplitText | undefined;

      const build = () => {
        split = SplitText.create(q(".b-head"), { type: "words,chars", mask: "words" });

        mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
          const { mobile } = ctx.conditions as { mobile: boolean };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: mobile ? "+=330%" : "+=400%",
              pin: q(".b-stage")[0],
              scrub: 1,
              anticipatePin: 1,
            },
          });

          // 1 — headline assembles, photos enter from different directions
          tl.from(split!.chars, { yPercent: 110, rotate: 8, stagger: 0.02, duration: 0.8, ease: "power3.out" }, 0)
            .from(q(".b-eyebrow"), { opacity: 0, y: 20, duration: 0.4 }, 0)
            .fromTo(q(".b-left"), { xPercent: -160, rotate: -14 }, { xPercent: 0, rotate: -5, duration: 1.2, ease: "power2.out" }, 0.1)
            .fromTo(q(".b-right"), { xPercent: 160, rotate: 12 }, { xPercent: 0, rotate: 4, duration: 1.2, ease: "power2.out" }, 0.2)
            .fromTo(q(".b-small"), { yPercent: 220 }, { yPercent: 0, duration: 1.2, ease: "power2.out" }, 0.3)
            .fromTo(q(".b-mask"), { clipPath: "inset(48% 46% 48% 46%)" }, { clipPath: mobile ? "inset(38% 22% 38% 22%)" : "inset(36% 38% 36% 38%)", duration: 1 }, 0.4)

            // 2 — the mask opens, layered parallax pushes the side photos away
            .to(q(".b-mask"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.inOut" }, 1.6)
            .fromTo(q(".b-mask-img"), { scale: 1.7 }, { scale: 1.05, duration: 3.2 }, 0.4)
            .to(q(".b-left"), { xPercent: -130, yPercent: -40, rotate: -18, duration: 1.6, ease: "power2.in" }, 1.6)
            .to(q(".b-right"), { xPercent: 140, yPercent: 30, rotate: 16, duration: 1.6, ease: "power2.in" }, 1.6)
            .to(q(".b-small"), { yPercent: -260, duration: 1.6, ease: "power2.in" }, 1.6)
            .to(q(".b-headwrap"), { yPercent: -60, opacity: 0, filter: "blur(8px)", duration: 1.1 }, 1.9)
            .to(q(".b-veil"), { opacity: 0.45, duration: 1 }, 2.4);

          // 3 — lines replace each other over the full-screen photograph
          const lines = q(".b-line");
          lines.forEach((line, i) => {
            const at = 3 + i * 1.2;
            tl.fromTo(line, { opacity: 0, yPercent: 40, filter: "blur(12px)" }, { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }, at);
            if (i < lines.length - 1) tl.to(line, { opacity: 0, yPercent: -40, filter: "blur(12px)", duration: 0.5, ease: "power2.in" }, at + 0.85);
          });
          tl.to(q(".b-mask-img"), { scale: 1.15, duration: lines.length * 1.2 }, 3)
            .to(q(".b-progress"), { scaleX: 1, duration: tl.duration(), ease: "none" }, 0)
            .to({}, { duration: 0.6 });
        });

        mm.add(MQ.reduced, () => {
          gsap.set(q(".b-mask"), { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(q(".b-line").slice(-1), { opacity: 1 });
          gsap.set(q(".b-headwrap"), { opacity: 0 });
        });
      };
      const cancelFonts = whenFontsReady(() => context.add(build));
      return () => {
        cancelFonts();
        mm.revert();
        split?.revert();
      };
    },
    { scope: root },
  );

  const p = beginning.photos;
  return (
    <section ref={root} id="beginning" className="relative bg-cream" aria-label="Chapter 01 — The Beginning">
      <div className="b-stage relative h-[100svh] w-full overflow-hidden">
        {/* side photos — different depths, different speeds */}
        <figure className="b-left absolute left-[4%] top-[14%] z-20 m-0 aspect-[3/4] w-[30vw] max-w-[300px] overflow-hidden bg-beige shadow-[0_30px_60px_rgba(48,40,36,0.25)] md:left-[8%] md:w-[18vw]">
          <Photo photo={p.left} />
        </figure>
        <figure className="b-right absolute bottom-[12%] right-[4%] z-20 m-0 aspect-[4/5] w-[34vw] max-w-[340px] overflow-hidden bg-beige shadow-[0_30px_60px_rgba(48,40,36,0.25)] md:right-[9%] md:w-[20vw]">
          <Photo photo={p.right} />
        </figure>
        <figure className="b-small absolute bottom-[8%] left-[16%] z-10 m-0 hidden aspect-square w-[11vw] overflow-hidden bg-beige shadow-xl md:block">
          <Photo photo={p.small} />
        </figure>

        {/* masked photograph that opens to full screen */}
        <div className="b-mask absolute inset-0 z-0" style={{ clipPath: "inset(48% 46% 48% 46%)" }}>
          <div className="b-mask-img h-full w-full">
            <Photo photo={p.main} />
          </div>
          <div className="b-veil absolute inset-0 bg-espresso opacity-0" />
        </div>

        {/* headline */}
        <div className="b-headwrap pointer-events-none absolute inset-x-0 top-[9%] z-30 px-6 text-center md:top-[11%]">
          <ChapterLabel id="beginning" className="b-eyebrow mb-6 justify-center" />
          <h2 className="b-head mx-auto max-w-[16ch] font-display text-[clamp(3rem,8.5vw,8.5rem)] text-espresso">{beginning.headline}</h2>
        </div>

        {/* lines over the photograph */}
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center px-6">
          {beginning.lines.map((l, i) => (
            <p
              key={i}
              className="b-line col-start-1 row-start-1 max-w-[18ch] text-center font-display text-[clamp(2.6rem,7vw,7rem)] italic text-cream opacity-0"
            >
              {l}
            </p>
          ))}
        </div>

        {/* scene progress */}
        <div className="absolute bottom-6 left-1/2 z-30 h-px w-40 -translate-x-1/2 bg-espresso/15 mix-blend-difference">
          <div className="b-progress h-full w-full origin-left scale-x-0 bg-champagne" />
        </div>
      </div>

      {/* 21st.dev — Scroll Choreography */}
      <ScrollChoreography images={beginning.choreography}>
        <p className="max-w-3xl font-display text-4xl italic text-cream md:text-7xl">{beginning.choreographyCaption}</p>
      </ScrollChoreography>
    </section>
  );
}
