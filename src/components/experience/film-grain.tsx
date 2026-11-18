/** Fixed analog film grain + soft vignette over the whole experience. */
export function FilmGrain() {
  return (
    <>
      <div aria-hidden className="film-grain" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[89]"
        style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(48,40,36,0.16) 100%)" }}
      />
    </>
  );
}
