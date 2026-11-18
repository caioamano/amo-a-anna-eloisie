import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { chapters } from "@/content/story";
import { ScrollTrigger, gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "./smooth-scroll";

/** Discreet story-progress rail on the right edge (replaces a traditional menu). */
export function ProgressRail() {
  const fill = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [marks, setMarks] = useState<number[]>(() => chapters.map((_, i) => i / chapters.length));
  const [open, setOpen] = useState(false);
  const { scrollTo } = useSmoothScroll();
  const tone = chapters[active].tone;

  useEffect(() => {
    // chapter starts in px, measured after every ScrollTrigger refresh (pins included)
    let starts: number[] = chapters.map(() => 0);
    const update = (y: number) => {
      const probe = y + window.innerHeight * 0.45;
      let idx = 0;
      starts.forEach((s, i) => probe >= s && (idx = i));
      setActive(idx);
    };
    const total = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(fill.current, { scaleY: self.progress });
        update(self.scroll());
      },
    });
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      starts = chapters.map((c) => {
        let el = document.getElementById(c.id);
        if (el?.parentElement?.classList.contains("pin-spacer")) el = el.parentElement;
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
      setMarks(starts.map((s) => (max > 0 ? Math.min(1, s / max) : 0)));
      update(window.scrollY);
    };
    ScrollTrigger.addEventListener("refresh", measure);
    measure();
    return () => {
      total.kill();
      ScrollTrigger.removeEventListener("refresh", measure);
    };
  }, []);

  const ink = tone === "dark" ? "bg-cream" : "bg-espresso";
  const text = tone === "dark" ? "text-cream" : "text-espresso";

  return (
    <nav
      aria-label="Story progress"
      className="fixed right-3 top-1/2 z-[70] hidden h-[56vh] -translate-y-1/2 md:right-7 md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="relative h-full w-8">
        <div className={cn("absolute left-1/2 top-0 h-full w-px -translate-x-1/2 opacity-20 transition-colors duration-700", ink)} />
        <div
          ref={fill}
          className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 scale-y-0 transition-[background-color] duration-700"
          style={{ backgroundColor: tone === "dark" ? "#B39A72" : "#793D4A" }}
        />
        {chapters.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => scrollTo(`#${c.id}`, { duration: 2.4 })}
            data-cursor="button"
            aria-label={`Go to chapter ${c.number}: ${c.title}`}
            aria-current={i === active ? "step" : undefined}
            className="group absolute left-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{ top: `${marks[i] * 100}%` }}
          >
            <span
              className={cn(
                "block rounded-full transition-all duration-500",
                i === active ? "h-2 w-2 bg-wine ring-4 ring-wine/15" : cn("h-[5px] w-[5px] opacity-40 group-hover:opacity-100", ink),
                i === active && tone === "dark" && "bg-champagne ring-champagne/20",
              )}
            />
            <span
              className={cn(
                "eyebrow pointer-events-none absolute right-8 whitespace-nowrap transition-all duration-500",
                text,
                open ? "translate-x-0 opacity-70" : "translate-x-2 opacity-0",
                i === active && "opacity-100",
              )}
            >
              {c.number} · {c.title}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {!open && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className={cn("absolute -bottom-14 right-0 text-right", text)}
          >
            <div className="font-serif text-2xl italic leading-none">{chapters[active].number}</div>
            <div className="eyebrow mt-1 whitespace-nowrap opacity-60">{chapters[active].title}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/** Mobile: a hairline progress bar at the very top. */
export function MobileProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => gsap.set(bar.current, { scaleX: s.progress }) });
    return () => st.kill();
  }, []);
  return <div ref={bar} className="fixed left-0 top-0 z-[70] h-[2px] w-full origin-left scale-x-0 bg-wine md:hidden" />;
}
