import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Photo as PhotoT } from "@/content/story";
import { Photo } from "./photo";
import { useSmoothScroll } from "./smooth-scroll";

type Open = (photo: PhotoT, from?: DOMRect) => void;
const LightboxCtx = createContext<Open>(() => {});
export const useLightbox = () => useContext(LightboxCtx);

type State = { photo: PhotoT; from?: DOMRect } | null;

/** Click any photo → it lifts from its exact position into a full view. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(null);
  const { lenis } = useSmoothScroll();
  const open = useCallback<Open>((photo, from) => setState({ photo, from }), []);
  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    if (!state) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [state, lenis, close]);

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const tw = Math.min(vw * 0.86, 1100);
  const th = Math.min(vh * 0.78, 820);
  const target = { left: (vw - tw) / 2, top: (vh - th) / 2 - 20, width: tw, height: th };
  const from = state?.from
    ? { left: state.from.left, top: state.from.top, width: state.from.width, height: state.from.height }
    : { ...target, opacity: 0 };

  return (
    <LightboxCtx.Provider value={open}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            key="lb"
            className="fixed inset-0 z-[80]"
            role="dialog"
            aria-modal="true"
            aria-label={state.photo.alt}
            onClick={close}
          >
            <motion.div
              className="absolute inset-0 bg-espresso/85 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            <motion.figure
              className="absolute m-0 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
              initial={{ ...from, borderRadius: 4 }}
              animate={{ ...target, opacity: 1, borderRadius: 2 }}
              exit={{ ...from, opacity: state.from ? 1 : 0 }}
              transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
            >
              <Photo photo={state.photo} eager className="object-contain bg-night" />
            </motion.figure>
            <motion.figcaption
              className="absolute inset-x-0 bottom-6 text-center font-serif text-xl italic text-cream md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              {state.photo.caption ?? state.photo.alt}
            </motion.figcaption>
            <motion.button
              type="button"
              aria-label="Close photo"
              data-cursor="button"
              className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:bg-cream hover:text-espresso"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            >
              <X className="h-5 w-5" strokeWidth={1.25} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxCtx.Provider>
  );
}
