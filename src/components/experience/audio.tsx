import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { music } from "@/content/story";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type AudioApi = { start: () => void; toggle: () => void; playing: boolean; available: boolean; started: boolean };
const AudioCtx = createContext<AudioApi>({ start: () => {}, toggle: () => {}, playing: false, available: true, started: false });
export const useMusic = () => useContext(AudioCtx);

/** Background music. Never autoplays — `start()` is called from "Begin our story". */
export function AudioProvider({ children }: { children: ReactNode }) {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const a = new Audio();
    a.src = music.src;
    a.loop = true;
    a.preload = "none";
    a.volume = 0;
    a.addEventListener("error", () => setAvailable(false));
    a.addEventListener("play", () => setPlaying(true));
    a.addEventListener("pause", () => setPlaying(false));
    el.current = a;
    return () => {
      a.pause();
      el.current = null;
    };
  }, []);

  const fadeIn = useCallback(() => {
    const a = el.current;
    if (!a) return;
    a.play()
      .then(() => gsap.to(a, { volume: music.volume, duration: 2.5, ease: "power1.out" }))
      .catch(() => setAvailable(false));
  }, []);

  const start = useCallback(() => {
    setStarted(true);
    fadeIn();
  }, [fadeIn]);

  const toggle = useCallback(() => {
    const a = el.current;
    if (!a) return;
    setStarted(true);
    if (a.paused) fadeIn();
    else gsap.to(a, { volume: 0, duration: 0.6, onComplete: () => a.pause() });
  }, [fadeIn]);

  return <AudioCtx.Provider value={{ start, toggle, playing, available, started }}>{children}</AudioCtx.Provider>;
}

export function MusicToggle() {
  const { toggle, playing, available, started } = useMusic();
  const [hover, setHover] = useState(false);
  return (
    <div className="fixed bottom-5 left-5 z-[70] mix-blend-difference md:bottom-8 md:left-8">
      <button
        type="button"
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        data-cursor="button"
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
        className="flex items-center gap-3 rounded-full px-2 py-2 text-cream"
      >
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn("music-bar block w-[2px] bg-cream", !playing && "!animate-none")}
              style={{ height: 16, animationDelay: `${i * 0.18}s`, transform: playing ? undefined : `scaleY(${0.2 + (i % 2) * 0.15})` }}
            />
          ))}
        </span>
        <AnimatePresence>
          {(hover || !started) && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="eyebrow hidden whitespace-nowrap sm:inline"
            >
              {!available ? "Add a song · /public/audio" : playing ? "Sound on" : "Sound off"}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
