import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  count?: number;
  /** "dust" floats softly upward (light chapters); "stars" twinkle (night). */
  mode?: "dust" | "stars";
  colors?: string[];
  /** cursor parallax strength in px */
  parallax?: number;
};

/** Lightweight 2D canvas particles: luminous dust or a twinkling star field. */
export function Particles({ className, count = 70, mode = "dust", colors = ["#B39A72", "#B98687", "#F4EFE6"], parallax = 18 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, running = true, visible = true;
    let mx = 0, my = 0, cx = 0, cy = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type P = { x: number; y: number; z: number; r: number; vx: number; vy: number; tw: number; c: string };
    let ps: P[] = [];

    const seed = () => {
      const n = window.innerWidth < 768 ? Math.round(count * 0.55) : count;
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.2 + Math.random() * 0.8,
        r: mode === "stars" ? 0.3 + Math.random() * 1.3 : 0.6 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.08,
        vy: mode === "stars" ? 0 : -(0.05 + Math.random() * 0.22),
        tw: Math.random() * Math.PI * 2,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    const draw = (t: number) => {
      raf = 0;
      if (!running || !visible) return;
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!reduced) {
          p.x += p.vx * p.z;
          p.y += p.vy * p.z;
          if (p.y < -10) p.y = h + 10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
        }
        const tw = mode === "stars" ? 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0012 * p.z + p.tw)) : 0.55 + 0.45 * Math.sin(t * 0.001 + p.tw);
        const x = p.x + cx * parallax * p.z;
        const y = p.y + cy * parallax * p.z;
        ctx.globalAlpha = tw * (mode === "stars" ? 0.9 : 0.6) * p.z;
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c;
        ctx.shadowBlur = mode === "stars" ? 6 * p.z : 10;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf && running && visible) raf = requestAnimationFrame(draw);
    };
    const move = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    resize();
    kick();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [count, mode, colors, parallax]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
