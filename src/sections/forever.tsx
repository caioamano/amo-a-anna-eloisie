import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ, whenFontsReady } from "@/lib/gsap";
import { forever, site } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { ChapterLabel } from "@/components/experience/chapter-label";
import { CinemaButton } from "@/components/experience/magnetic";
import { Particles } from "@/components/experience/particles";
import { useSmoothScroll } from "@/components/experience/smooth-scroll";
import { RELIVE_EVENT } from "./letter";

/* ==========================================================================
   CHAPTER 07 — FOREVER STARTS HERE
   Full-screen warm photograph that slowly settles as you scroll (pinned,
   scrubbed); "To be continued..." writes in, ANNA ELOISIE returns with its
   letter-spacing breathing closed, the signature appears and
   "Relive our story" glides back to the very first frame.
   ========================================================================== */

export function Forever() {
  const root = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    (context) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      let split: SplitText | undefined;
      const build = () => {
        split = SplitText.create(q(".f-head"), { type: "chars" });
        mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, () => {
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: root.current, start: "top top", end: "+=180%", pin: true, scrub: 1, anticipatePin: 1 },
            })
            .fromTo(q(".f-photo"), { scale: 1.35, filter: "brightness(0.55) saturate(0.8)" }, { scale: 1, filter: "brightness(0.85) saturate(1)", duration: 3 }, 0)
            .from(q(".f-label"), { opacity: 0, y: 20, duration: 0.4 }, 0.2)
            .from(split!.chars, { opacity: 0, y: 40, filter: "blur(12px)", stagger: 0.05, duration: 0.6, ease: "power2.out" }, 0.3)
            .fromTo(q(".f-name"), { letterSpacing: "0.6em", opacity: 0 }, { letterSpacing: "0.02em", opacity: 1, duration: 1.4, ease: "power2.out" }, 1)
            .from(q(".f-sign, .f-cta"), { opacity: 0, y: 24, stagger: 0.15, duration: 0.5 }, 2.1)
            .to({}, { duration: 0.4 });
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

  const relive = () => {
    window.dispatchEvent(new Event(RELIVE_EVENT));
    scrollTo(0, { duration: 5 });
  };

  return (
    <section ref={root} id="forever" className="relative h-[100svh] w-full overflow-hidden bg-espresso text-cream" aria-label="Chapter 07 — Forever Starts Here">
      <div className="f-photo absolute inset-0">
        <Photo photo={forever.photo} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-wine/30" />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(179,154,114,0.6), transparent 60%)" }} />
      <Particles count={45} colors={["#B39A72", "#F4EFE6"]} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <ChapterLabel id="forever" tone="light" className="f-label mb-8" />
        <h2 className="f-head font-display text-[clamp(3.4rem,10vw,10rem)] italic">{forever.headline}</h2>
        <p className="f-name mt-8 font-sans text-[clamp(0.9rem,2.4vw,1.6rem)] font-light uppercase text-champagne">{site.name}</p>
        <p className="f-sign mt-10 font-serif text-2xl italic text-cream/85 md:text-3xl">
          with love, <span className="text-champagne">{site.from}</span>
        </p>
        <div className="f-cta mt-12">
          <CinemaButton tone="light" onClick={relive}>
            <span aria-hidden>↺</span> {forever.replay}
          </CinemaButton>
        </div>
      </div>

      <footer className="absolute inset-x-0 bottom-5 z-10 flex justify-between px-6 text-cream/40 md:px-12">
        <span className="eyebrow">Made for {site.firstName} {site.lastName}</span>
        <span className="eyebrow">Fin — for now</span>
      </footer>
    </section>
  );
}
