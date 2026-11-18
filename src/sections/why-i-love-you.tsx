import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ, whenFontsReady } from "@/lib/gsap";
import { reasons } from "@/content/story";
import { ChapterLabel } from "@/components/experience/chapter-label";
import { RevealText } from "@/components/ui/reveal-text";
import { cn } from "@/lib/utils";

/* ==========================================================================
   CHAPTER 04 — WHY I LOVE YOU
   Pure typography. One long pinned, scrubbed scene: giant outlined words
   drift in parallax behind; each reason enters with its own technique
   (mask rise, blur words, scattered chars, wipe mask) in a different spot of
   the frame, then dissolves. The scene ends by sinking into the night —
   a circular portal that opens Chapter 05.
   Reasons are edited in src/content/story.ts (any number works).
   ========================================================================== */

const LAYOUTS = [
  "items-center justify-center text-center",
  "items-start justify-start text-left pt-[20vh] pl-[6vw] pr-[10vw]",
  "items-end justify-end text-right pb-[16vh] pr-[8vw] pl-[10vw]",
  "items-center justify-center text-center",
];
const SIZES = [
  "text-[clamp(4.5rem,15vw,15rem)]",
  "text-[clamp(2.6rem,6.5vw,6.5rem)] max-w-[16ch]",
  "text-[clamp(2.8rem,7vw,7rem)] max-w-[14ch] italic text-wine",
  "text-[clamp(3.6rem,11vw,11rem)] max-w-[12ch]",
];

export function WhyILoveYou() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (context) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const splits: SplitText[] = [];

      const build = () => {
        mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
          const { mobile } = ctx.conditions as { mobile: boolean };
          const items = q(".r-item");
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: q(".r-stage")[0], start: "top top", end: `+=${(items.length + 2) * (mobile ? 70 : 85)}%`, pin: true, scrub: 1, anticipatePin: 1 },
          });

          // parallax typography layers (different speeds)
          tl.fromTo(q(".r-giant-1"), { xPercent: 10 }, { xPercent: -55, duration: items.length + 2 }, 0)
            .fromTo(q(".r-giant-2"), { xPercent: -60 }, { xPercent: 5, duration: items.length + 2 }, 0)
            .to(q(".r-intro"), { opacity: 0, yPercent: -40, filter: "blur(10px)", duration: 0.5 }, 0.4);

          items.forEach((item, i) => {
            const t = gsap.utils.selector(item)(".r-text")[0];
            const at = 0.7 + i;
            const v = i % 4;
            gsap.set(item, { autoAlpha: 1 });
            if (v === 0) {
              const s = SplitText.create(t, { type: "words,chars", mask: "words" });
              splits.push(s);
              tl.from(s.chars, { yPercent: 120, stagger: 0.04, duration: 0.5, ease: "power3.out" }, at);
            } else if (v === 1) {
              const s = SplitText.create(t, { type: "words" });
              splits.push(s);
              tl.from(s.words, { opacity: 0, filter: "blur(16px)", y: 30, stagger: 0.06, duration: 0.5 }, at);
            } else if (v === 2) {
              const s = SplitText.create(t, { type: "words,chars" });
              splits.push(s);
              tl.from(s.chars, { opacity: 0, scale: 0.2, rotate: () => gsap.utils.random(-90, 90), y: () => gsap.utils.random(-120, 120), stagger: 0.015, duration: 0.5, ease: "back.out(1.6)" }, at);
            } else {
              tl.fromTo(t, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power2.inOut" }, at);
            }
            tl.fromTo(item.querySelector(".r-index"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, at)
              .to(t, { scale: 1.04, duration: 0.9 }, at)
              .to(item, { opacity: 0, filter: "blur(14px)", scale: 0.96, duration: 0.3, ease: "power2.in" }, at + 0.75);
          });

          const end = 0.7 + items.length;
          tl.fromTo(q(".r-closing"), { opacity: 0, letterSpacing: "0.4em" }, { opacity: 1, letterSpacing: "0em", duration: 0.6, ease: "power2.out" }, end)
            .to(q(".r-stage"), { backgroundColor: "#793D4A", duration: 0.6 }, end + 0.2)
            .to(q(".r-closing"), { color: "#F4EFE6", duration: 0.4 }, end + 0.2)
            .to(q(".r-giant"), { color: "#B98687", duration: 0.4 }, end + 0.2)
            .fromTo(q(".r-portal"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.9, ease: "power2.in" }, end + 0.7)
            .to(q(".r-closing"), { scale: 0.85, opacity: 0, duration: 0.5 }, end + 0.8);
        });

        mm.add(MQ.reduced, () => {
          gsap.set(q(".r-stage"), { height: "auto", paddingBlock: "20vh" });
          gsap.set(q(".r-intro, .r-item"), { position: "relative", autoAlpha: 1, paddingBlock: "8vh" });
          gsap.set(q(".r-closing"), { opacity: 1 });
          gsap.set(q(".r-closing-wrap"), { position: "relative", paddingBlock: "8vh" });
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

  return (
    <section ref={root} id="why-i-love-you" className="relative" aria-label="Chapter 04 — Why I Love You">
      <div className="r-stage relative h-[100svh] w-full overflow-hidden bg-beige">
        {/* giant parallax typography */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-[6vh] overflow-hidden">
          <p className="r-giant r-giant-1 text-outline whitespace-nowrap font-display text-[24vw] leading-none text-espresso/25">a thousand reasons ·</p>
          <p className="r-giant r-giant-2 whitespace-nowrap font-display text-[16vw] italic leading-none text-espresso/[0.06]">and every single one is you ·</p>
        </div>

        <div className="r-intro absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <ChapterLabel id="why-i-love-you" className="mb-8" />
          <RevealText
            type="chars"
            gsapVars={{ x: 0, yPercent: 60, opacity: 0, filter: "blur(10px)", stagger: 0.025, duration: 0.9 }}
            scroll={{ start: "top 70%", toggleActions: "play none none reverse" }}
            className="max-w-[12ch] font-display text-[clamp(3.2rem,9vw,9rem)] text-espresso"
          >
            {reasons.headline}
          </RevealText>
        </div>

        {reasons.items.map((r, i) => (
          <div key={i} className={cn("r-item invisible absolute inset-0 z-10 flex px-6", LAYOUTS[i % 4])}>
            <div>
              <p className="r-index eyebrow mb-5 text-wine">Reason N° {String(i + 1).padStart(3, "0")}</p>
              <p className={cn("r-text font-display text-espresso will-change-transform", SIZES[i % 4])}>{r}</p>
            </div>
          </div>
        ))}

        <div className="r-closing-wrap pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <p className="r-closing font-display text-[clamp(3rem,9vw,9rem)] italic text-espresso opacity-0">{reasons.closing}</p>
        </div>

        {/* portal into the night (Chapter 05) */}
        <div className="r-portal absolute inset-0 z-20 bg-night" style={{ clipPath: "circle(0% at 50% 50%)" }} aria-hidden>
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(121,61,74,.55), transparent 60%)" }} />
        </div>
      </div>
    </section>
  );
}
