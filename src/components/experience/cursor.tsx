import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer } from "@/hooks/use-media";

/**
 * Morphing magnetic cursor (desktop only).
 *  - default: small dot + trailing ring
 *  - [data-cursor="button"]: ring morphs into the element's own shape
 *  - [data-cursor="view"] / [data-cursor-label]: ring grows and shows a label
 *  - [data-cursor-sparkle]: click releases champagne particles
 */
export function Cursor() {
  const fine = useFinePointer();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const sparks = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("has-custom-cursor");
    const d = dot.current!, r = ring.current!, l = label.current!;
    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });

    let locked: HTMLElement | null = null;
    let visible = false;

    const move = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      if (locked) {
        const b = locked.getBoundingClientRect();
        // stay on the element but lean a little toward the pointer (magnetic)
        rx(b.left + b.width / 2 + (e.clientX - (b.left + b.width / 2)) * 0.15);
        ry(b.top + b.height / 2 + (e.clientY - (b.top + b.height / 2)) * 0.15);
      } else {
        rx(e.clientX);
        ry(e.clientY);
      }
    };

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const btn = t.closest<HTMLElement>('[data-cursor="button"]');
      const view = t.closest<HTMLElement>('[data-cursor="view"], [data-cursor-label]');
      if (btn) {
        locked = btn;
        const b = btn.getBoundingClientRect();
        const radius = getComputedStyle(btn).borderRadius;
        gsap.to(r, { width: b.width + 14, height: b.height + 14, borderRadius: radius === "0px" ? 6 : radius, borderColor: "rgba(179,154,114,0.9)", backgroundColor: "rgba(179,154,114,0.08)", duration: 0.45, ease: "power3.out" });
        gsap.to(d, { scale: 0, duration: 0.25 });
        l.textContent = "";
      } else if (view) {
        locked = null;
        l.textContent = view.dataset.cursorLabel ?? "View";
        gsap.to(r, { width: 92, height: 92, borderRadius: "50%", backgroundColor: "rgba(121,61,74,0.88)", borderColor: "rgba(121,61,74,0)", duration: 0.5, ease: "power3.out" });
        gsap.to(l, { autoAlpha: 1, scale: 1, duration: 0.35 });
        gsap.to(d, { scale: 0, duration: 0.25 });
      } else {
        locked = null;
        l.textContent = "";
        gsap.to(l, { autoAlpha: 0, scale: 0.6, duration: 0.2 });
        gsap.to(r, { width: 38, height: 38, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0)", borderColor: "rgba(179,154,114,0.7)", duration: 0.45, ease: "power3.out" });
        gsap.to(d, { scale: 1, duration: 0.25 });
      }
    };

    const down = () => gsap.to(r, { scale: 0.82, duration: 0.2 });
    const up = () => gsap.to(r, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.4)" });

    const click = (e: MouseEvent) => {
      if (reduced) return;
      if (!(e.target as HTMLElement).closest("[data-cursor-sparkle]")) return;
      const host = sparks.current!;
      for (let i = 0; i < 14; i++) {
        const p = document.createElement("span");
        const size = 2 + Math.random() * 4;
        p.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;border-radius:50%;background:${i % 3 ? "#B39A72" : "#B98687"};pointer-events:none;box-shadow:0 0 8px rgba(179,154,114,.8)`;
        host.appendChild(p);
        const a = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 70;
        gsap.to(p, { x: Math.cos(a) * dist, y: Math.sin(a) * dist - 20, opacity: 0, scale: 0.2, duration: 0.9 + Math.random() * 0.5, ease: "power3.out", onComplete: () => p.remove() });
      }
    };

    const leave = () => {
      visible = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("click", click);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("click", click);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fine]);

  if (!fine) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ring}
        className="invisible fixed left-0 top-0 grid h-[38px] w-[38px] place-items-center rounded-full border border-champagne/70 opacity-0"
      >
        <span ref={label} className="invisible font-sans text-[0.6rem] uppercase tracking-[0.25em] text-cream opacity-0" />
      </div>
      <div ref={dot} className="invisible fixed left-0 top-0 h-[6px] w-[6px] rounded-full bg-wine opacity-0 shadow-[0_0_0_1px_rgba(244,239,230,0.6)]" />
      <div ref={sparks} />
    </div>
  );
}
