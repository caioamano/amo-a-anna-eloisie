import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { littleThings, type Photo as PhotoT } from "@/content/story";
import { Photo } from "@/components/experience/photo";
import { ChapterLabel } from "@/components/experience/chapter-label";
import { useLightbox } from "@/components/experience/lightbox";
import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { ParallaxScrollSecond } from "@/components/ui/parallax-scroll";
import { RevealText } from "@/components/ui/reveal-text";
import { cn } from "@/lib/utils";

/* ==========================================================================
   CHAPTER 03 — THE LITTLE THINGS
   Scroll Morph Hero (21st.dev) → photographs falling onto a table (pinned
   GSAP scrub, 3D tilt + glare) → Zoom Parallax (21st.dev) → Interactive
   accordion → Parallax Grid Scroll (21st.dev). Every photo opens a lightbox.
   ========================================================================== */

/** 3D tilt card with a moving glare highlight. */
function TiltCard({ photo, className, caption }: { photo: PhotoT; className?: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const open = useLightbox();

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gsap.to(el, { rotateY: (px - 0.5) * 22, rotateX: (0.5 - py) * 22, scale: 1.06, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    gsap.to(glare.current, { opacity: 0.55, background: `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,250,240,.75), transparent 55%)`, duration: 0.3 });
  };
  const onLeave = () => {
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.45)" });
    gsap.to(glare.current, { opacity: 0, duration: 0.5 });
  };

  return (
    <div className={cn("[perspective:900px]", className)}>
      <div
        ref={ref}
        className="paper relative cursor-pointer p-2.5 pb-10 shadow-[0_20px_40px_rgba(48,40,36,0.25)] [transform-style:preserve-3d] md:p-3 md:pb-12"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-cursor="view"
        onClick={(e) => open(photo, e.currentTarget.getBoundingClientRect())}
      >
        <div className="aspect-[4/5] overflow-hidden bg-beige">
          <Photo photo={photo} />
        </div>
        <p className="absolute inset-x-0 bottom-2.5 text-center font-serif text-sm italic text-espresso/70 md:bottom-3.5 md:text-base">{caption ?? photo.caption}</p>
        <div ref={glare} className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light" />
      </div>
    </div>
  );
}

/** Table layout (percent positions & rotations) for the scattered photographs. */
const TABLE = [
  { l: 6, t: 10, r: -9, w: 17 }, { l: 27, t: 4, r: 5, w: 15 }, { l: 46, t: 14, r: -3, w: 19 },
  { l: 70, t: 6, r: 8, w: 16 }, { l: 12, t: 50, r: 6, w: 16 }, { l: 33, t: 46, r: -7, w: 17 },
  { l: 55, t: 52, r: 4, w: 15 }, { l: 76, t: 48, r: -10, w: 16 }, { l: 40, t: 28, r: 2, w: 20 },
];

function PhotoTable() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const { mobile } = ctx.conditions as { mobile: boolean };
        const cards = q(".tbl-card");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: mobile ? "+=180%" : "+=220%", pin: true, scrub: 1, anticipatePin: 1 },
        });
        tl.from(q(".tbl-title .split-line > *"), { yPercent: 105, stagger: 0.1, duration: 0.5, ease: "power3.out" }, 0);
        cards.forEach((c, i) => {
          const fromLeft = i % 2 === 0;
          tl.from(
            c,
            {
              x: (fromLeft ? -1 : 1) * window.innerWidth * (0.6 + Math.random() * 0.3),
              y: -window.innerHeight * (0.5 + Math.random() * 0.6),
              rotate: (fromLeft ? -1 : 1) * (40 + Math.random() * 40),
              scale: 1.6,
              duration: 1,
              ease: "power3.out",
            },
            0.2 + i * 0.22,
          );
        });
        tl.to(q(".tbl-light"), { opacity: 1, duration: 1 }, 1.2).to({}, { duration: 0.5 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-[100svh] overflow-hidden bg-beige">
      <div
        className="tbl-light pointer-events-none absolute inset-0 opacity-40"
        style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(244,239,230,.9), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(185,134,135,.25), transparent 50%)" }}
      />
      <div className="tbl-title pointer-events-none absolute inset-x-0 bottom-[6%] z-20 px-6 text-center md:bottom-[8%]">
        <div className="split-line">
          <p className="eyebrow text-wine">Developed, kept, and left on the table</p>
        </div>
        <div className="split-line mt-3">
          <h3 className="font-display text-4xl italic text-espresso md:text-6xl">Small things, kept forever.</h3>
        </div>
      </div>
      <div className="relative mx-auto h-full max-w-[1500px]">
        {littleThings.table.map((photo, i) => {
          const s = TABLE[i % TABLE.length];
          return (
            <div
              key={i}
              className="tbl-card absolute"
              style={{ left: `${s.l}%`, top: `${s.t + 4}%`, rotate: `${s.r}deg`, zIndex: i === 8 ? 5 : 1, ["--w" as string]: `${s.w}vw` }}
            >
              <div className="w-[36vw] md:w-[var(--w)] md:max-w-[280px]">
                <TiltCard photo={photo} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Interactive Image Accordion — hover (desktop) / tap (mobile) to open a panel. */
function Accordion() {
  const [active, setActive] = useState(0);
  const open = useLightbox();
  return (
    <div className="mx-auto max-w-[1500px] px-6 py-28 md:px-12 md:py-40">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <RevealText type="words" scroll gsapVars={{ x: 0, y: 40, rotation: 0, stagger: 0.08, filter: "blur(8px)" }} className="max-w-[12ch] font-display text-5xl text-espresso md:text-7xl">
          The details nobody else would notice.
        </RevealText>
        <p className="max-w-xs font-sans text-sm leading-relaxed text-espresso/60">[ Each panel holds a little thing. Edit titles and texts in src/content/story.ts ]</p>
      </div>
      <div className="flex h-[78vh] flex-col gap-2 md:h-[70vh] md:flex-row md:gap-3">
        {littleThings.accordion.map((item, i) => {
          const isActive = i === active;
          return (
            <motion.button
              type="button"
              key={i}
              layout
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={(e) => (isActive ? open(item.photo, e.currentTarget.getBoundingClientRect()) : setActive(i))}
              aria-expanded={isActive}
              data-cursor-label={isActive ? "Open" : "Look"}
              className="relative overflow-hidden bg-beige text-left outline-none focus-visible:ring-2 focus-visible:ring-wine"
              style={{ flex: isActive ? 5 : 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 24 }}
            >
              <motion.div layout className="absolute inset-0">
                <Photo photo={item.photo} className={cn("transition-[transform,filter] duration-[1.2s]", isActive ? "scale-100 grayscale-0" : "scale-110 grayscale-[60%]")} />
              </motion.div>
              <div className={cn("absolute inset-0 transition-colors duration-700", isActive ? "bg-gradient-to-t from-espresso/75 via-transparent to-transparent" : "bg-espresso/40")} />
              <span className="eyebrow absolute left-4 top-4 text-cream/80 md:left-5 md:top-5">{String(i + 1).padStart(2, "0")}</span>
              <motion.div
                className="absolute bottom-0 left-0 p-5 md:p-8"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                transition={{ duration: 0.5, delay: isActive ? 0.2 : 0 }}
              >
                <h4 className="font-display text-3xl italic text-cream md:text-5xl">{item.title}</h4>
                <p className="mt-2 max-w-sm font-sans text-sm text-cream/75">{item.text}</p>
              </motion.div>
              {!isActive && (
                <span className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 -rotate-90 whitespace-nowrap font-serif text-xl italic text-cream md:block">
                  {item.title}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function LittleThings() {
  return (
    <section id="little-things" className="relative bg-cream" aria-label="Chapter 03 — The Little Things">
      {/* 21st.dev — Scroll Morph Hero */}
      <IntroAnimation
        images={littleThings.morphPhotos}
        introText={littleThings.morphIntro}
        introHint="SCROLL TO COLLECT"
        title={littleThings.morphTitle}
        text={littleThings.morphText}
        length={2.2}
      />

      <PhotoTable />

      {/* 21st.dev — Zoom Parallax */}
      <ZoomParallax images={littleThings.zoom}>
        <div>
          <ChapterLabel id="little-things" className="mb-6 justify-center" />
          <p className="font-display text-[clamp(3rem,9vw,9rem)] italic text-espresso">{littleThings.headline}</p>
        </div>
      </ZoomParallax>

      <Accordion />

      {/* 21st.dev — Parallax Grid Scroll */}
      <div className="relative bg-cream">
        <div className="mx-auto max-w-5xl px-6 pt-10 text-center md:px-10">
          <p className="eyebrow text-wine">An album with no last page</p>
        </div>
        <ParallaxScrollSecond images={littleThings.grid} />
      </div>
    </section>
  );
}
