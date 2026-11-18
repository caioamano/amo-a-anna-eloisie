import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP, MQ, whenFontsReady } from "@/lib/gsap";
import { universe } from "@/content/story";
import { ChapterLabel } from "@/components/experience/chapter-label";
import { Particles } from "@/components/experience/particles";
import { useFinePointer, useInView, useIsMobile } from "@/hooks/use-media";
import UnfurlingGallery from "@/components/ui/3d-parallax-unfurling-gallery";

// WebGL / canvas effects are split out and loaded on demand
const ShaderBackground = lazy(() => import("@/components/ui/silky-moving-background"));
const OrbFlowBackground = lazy(() => import("@/components/ui/orb-flow-background"));
const TubesBackground = lazy(() => import("@/components/ui/neon-flow"));

/* ==========================================================================
   CHAPTER 05 — OUR UNIVERSE
   The only nocturnal, experimental chapter. A persistent sticky sky
   (Silky Moving Background shader + star field + cursor light) sits behind
   three scenes:
     A. Pinned "And this is only the beginning." with the Orb Flow sphere and
        lines floating at different depths, ending in a warp toward camera.
     B. 3D Parallax Unfurling Gallery of memories.
     C. "Touch the light" — Cursor Effects (Neon Flow tubes) in warm tones.
   ========================================================================== */

const LINE_POS = [
  "left-[8%] top-[22%]",
  "right-[10%] top-[34%] text-right",
  "left-[14%] bottom-[24%]",
  "right-[12%] bottom-[14%] text-right",
];
const LINE_DEPTH = [0.6, 1, 0.8, 1.25];

function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    const x = gsap.quickTo(el, "x", { duration: 1.2, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 1.2, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
      style={{ background: "radial-gradient(circle, rgba(185,134,135,0.22) 0%, rgba(179,154,114,0.08) 35%, transparent 65%)" }}
    />
  );
}

function SceneA() {
  const root = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  const near = useInView(root, "150% 0px");

  useGSAP(
    (context) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      let split: SplitText | undefined;
      const build = () => {
        split = SplitText.create(q(".u-head"), { type: "words,chars" });
        mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, () => {
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: root.current, start: "top top", end: "+=320%", pin: true, scrub: 1, anticipatePin: 1 },
          });
          tl.fromTo(q(".u-orb"), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0)
            .from(q(".u-label"), { opacity: 0, y: 20, duration: 0.4 }, 0.2)
            .from(split!.chars, { opacity: 0, scale: 2.2, filter: "blur(18px)", z: 200, stagger: { each: 0.025, from: "center" }, duration: 0.8, ease: "power3.out" }, 0.3)
            .to(q(".u-headwrap"), { yPercent: -10, scale: 0.82, duration: 1.4 }, 1.4);
          q(".u-line").forEach((l, i) => {
            const d = LINE_DEPTH[i % LINE_DEPTH.length];
            tl.fromTo(l, { opacity: 0, scale: 0.6, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, 1.5 + i * 0.35).fromTo(
              l,
              { y: 80 * d },
              { y: -120 * d, duration: 2.6 },
              1.5 + i * 0.35,
            );
          });
          // warp toward the camera, into the gallery
          tl.to(q(".u-line"), { scale: 2.6, opacity: 0, filter: "blur(10px)", stagger: 0.05, duration: 0.7, ease: "power2.in" }, 3.6)
            .to(q(".u-headwrap"), { scale: 3, opacity: 0, filter: "blur(16px)", duration: 0.8, ease: "power2.in" }, 3.6)
            .to(q(".u-orb"), { scale: 3.2, opacity: 0, duration: 0.9, ease: "power2.in" }, 3.7);
        });
        mm.add(MQ.reduced, () => gsap.set(q(".u-line"), { opacity: 1 }));
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

  return (
    <div ref={root} className="relative z-10 h-[100svh] w-full overflow-hidden [perspective:900px]">
      <div className="u-orb absolute inset-0">
        {near && (
          <Suspense fallback={null}>
            <OrbFlowBackground
              theme="dark"
              orbColor="#B39A72"
              flowColor="#B98687"
              orbRadiusPx={mobile ? 120 : 210}
              numFlowLines={mobile ? 30 : 60}
              particleSize={1.8}
              lineWidth={0.8}
              showCursor={false}
              showGlow
            />
          </Suspense>
        )}
      </div>
      <div className="u-headwrap absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <ChapterLabel id="our-universe" tone="light" className="u-label mb-8" />
        <h2 className="u-head max-w-[13ch] font-display text-[clamp(3.2rem,9vw,9.5rem)] text-cream [text-shadow:0_0_40px_rgba(185,134,135,0.35)]">
          {universe.headline}
        </h2>
      </div>
      {universe.lines.map((l, i) => (
        <p key={i} className={`u-line absolute font-serif text-2xl italic text-beige opacity-0 md:text-5xl ${LINE_POS[i % LINE_POS.length]}`}>
          {l}
        </p>
      ))}
    </div>
  );
}

function SceneC() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, "50% 0px");
  const fine = useFinePointer();
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  const useTubes = fine && !failed && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={ref} className="relative z-10 h-[100svh] w-full overflow-hidden">
      {near && (
        <Suspense fallback={null}>
          {useTubes ? (
            <TubesBackground className="absolute inset-0 min-h-0" onFail={onFail}>
              <div />
            </TubesBackground>
          ) : (
            <OrbFlowBackground theme="dark" orbRadiusPx={90} numFlowLines={40} particleSize={1.6} numLatitudeLines={12} />
          )}
        </Suspense>
      )}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end gap-4 px-6 pb-[14vh] text-center">
        <p className="font-display text-4xl italic text-cream md:text-6xl">Every light leads back to you.</p>
        <p className="eyebrow text-champagne/80">{useTubes ? universe.touchLine : "Touch the light."}</p>
      </div>
    </div>
  );
}

export function OurUniverse() {
  const root = useRef<HTMLElement>(null);
  const near = useInView(root, "100% 0px");

  return (
    <section ref={root} id="our-universe" className="relative bg-night text-cream" aria-label="Chapter 05 — Our Universe">
      {/* persistent night sky */}
      <div className="sticky top-0 z-0 -mb-[100svh] h-[100svh] w-full overflow-hidden" aria-hidden>
        {near && (
          <Suspense fallback={null}>
            <ShaderBackground className="absolute inset-0 opacity-60" />
          </Suspense>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-night via-transparent to-night/80" />
        <Particles mode="stars" count={170} colors={["#F4EFE6", "#E5D8C8", "#B39A72", "#B98687"]} parallax={30} />
        <CursorLight />
      </div>

      <SceneA />

      <div className="relative z-10">
        <UnfurlingGallery
          images={universe.gallery}
          heading={
            <div>
              <p className="eyebrow mb-5 text-champagne">Every memory, a star</p>
              <p className="font-display text-5xl italic text-cream md:text-8xl">A sky made of us.</p>
            </div>
          }
        />
      </div>

      <SceneC />
    </section>
  );
}
