import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Wrapper that gently pulls its child toward the cursor, then springs back elastically. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} data-magnetic className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}

/** Elegant pill button with an ink-fill hover and an elastic press. */
export function CinemaButton({
  children,
  onClick,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <Magnetic>
      <button
        type="button"
        onClick={onClick}
        data-cursor="button"
        data-cursor-sparkle
        className={cn(
          "group relative isolate overflow-hidden rounded-full border px-9 py-4 font-sans text-[0.7rem] uppercase tracking-[0.32em] transition-[color,transform] duration-500 active:scale-95",
          dark ? "border-espresso/40 text-espresso hover:text-cream" : "border-cream/40 text-cream hover:text-espresso",
          className,
        )}
      >
        <span
          className={cn(
            "absolute inset-0 -z-10 translate-y-full rounded-full transition-transform duration-700 ease-[var(--ease-cinema)] group-hover:translate-y-0",
            dark ? "bg-wine" : "bg-cream",
          )}
        />
        <span className="relative inline-flex items-center gap-3">{children}</span>
      </button>
    </Magnetic>
  );
}
