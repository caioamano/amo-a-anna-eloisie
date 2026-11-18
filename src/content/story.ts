/* ==========================================================================
   ANNA ELOISIE — CENTRAL CONTENT FILE
   --------------------------------------------------------------------------
   Everything personal lives here: texts, photos, dates, memories, music.
   Anything wrapped in [ BRACKETS ] or marked PLACEHOLDER is provisional and
   should be replaced with your real content.

   PHOTOS
   - Put your own photos in /public/photos/ (e.g. /public/photos/us-01.jpg)
     and reference them as "/photos/us-01.jpg".
   - Until then, every photo uses a stock image (`src`) and falls back to a
     labelled local placeholder (`fallback`) if the stock image can't load.
   - Set USE_STOCK_PHOTOS = false to show only the labelled placeholders.
   ========================================================================== */

export const USE_STOCK_PHOTOS = true;

export type Photo = {
  id: string;
  /** Your photo. Replace with "/photos/your-file.jpg". */
  src: string;
  /** Labelled local placeholder, used when `src` fails or stock is off. */
  fallback: string;
  alt: string;
  caption?: string;
};

const ph = (n: number) =>
  `/photos/placeholders/photo-${String(n).padStart(2, "0")}.svg`;
const stock = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** PLACEHOLDER photo library — swap each `src` for your own photographs. */
export const photos = {
  hero: { id: "hero", src: stock("1518199266791-5375a83190b7", 2000), fallback: ph(1), alt: "[ Hero photo — replace ]", caption: "[ The photo that opens our story ]" },
  heroBg: { id: "heroBg", src: stock("1470252649378-9c29740c9fa8", 2000), fallback: ph(2), alt: "[ Background photo — replace ]" },
  p01: { id: "p01", src: stock("1516589178581-6cd7833ae3b2"), fallback: ph(3), alt: "[ Photo 03 ]", caption: "[ Caption 03 ]" },
  p02: { id: "p02", src: stock("1529333166437-7750a6dd5a70"), fallback: ph(4), alt: "[ Photo 04 ]", caption: "[ Caption 04 ]" },
  p03: { id: "p03", src: stock("1522673607200-164d1b6ce486"), fallback: ph(5), alt: "[ Photo 05 ]", caption: "[ Caption 05 ]" },
  p04: { id: "p04", src: stock("1494774157365-9e04c6720e47"), fallback: ph(6), alt: "[ Photo 06 ]", caption: "[ Caption 06 ]" },
  p05: { id: "p05", src: stock("1515934751635-c81c6bc9a2d8"), fallback: ph(7), alt: "[ Photo 07 ]", caption: "[ Caption 07 ]" },
  p06: { id: "p06", src: stock("1507504031003-b417219a0fde"), fallback: ph(8), alt: "[ Photo 08 ]", caption: "[ Caption 08 ]" },
  p07: { id: "p07", src: stock("1474552226712-ac0f0961a954"), fallback: ph(9), alt: "[ Photo 09 ]", caption: "[ Caption 09 ]" },
  p08: { id: "p08", src: stock("1501901609772-df0848060b33"), fallback: ph(10), alt: "[ Photo 10 ]", caption: "[ Caption 10 ]" },
  p09: { id: "p09", src: stock("1519741497674-611481863552"), fallback: ph(11), alt: "[ Photo 11 ]", caption: "[ Caption 11 ]" },
  p10: { id: "p10", src: stock("1511285560929-80b456fea0bc"), fallback: ph(12), alt: "[ Photo 12 ]", caption: "[ Caption 12 ]" },
  p11: { id: "p11", src: stock("1465495976277-4387d4b0b4c6"), fallback: ph(13), alt: "[ Photo 13 ]", caption: "[ Caption 13 ]" },
  p12: { id: "p12", src: stock("1469371670807-013ccf25f16a"), fallback: ph(14), alt: "[ Photo 14 ]", caption: "[ Caption 14 ]" },
  p13: { id: "p13", src: stock("1523438885200-e635ba2c371e"), fallback: ph(15), alt: "[ Photo 15 ]", caption: "[ Caption 15 ]" },
  p14: { id: "p14", src: stock("1504196606672-aef5c9cefc92"), fallback: ph(16), alt: "[ Photo 16 ]", caption: "[ Caption 16 ]" },
  p15: { id: "p15", src: stock("1500530855697-b586d89ba3ee"), fallback: ph(17), alt: "[ Photo 17 ]", caption: "[ Caption 17 ]" },
  finale: { id: "finale", src: stock("1508672019048-805c876b67e2", 2200), fallback: ph(18), alt: "[ Final photo — replace ]" },
} satisfies Record<string, Photo>;

const all = Object.values(photos);
/** Helper: cycles through the library so galleries never run out. */
export const pick = (count: number, offset = 0): Photo[] =>
  Array.from({ length: count }, (_, i) => all[(i + offset) % all.length]);

/* ------------------------------------------------------------------------ */

export const site = {
  name: "ANNA ELOISIE",
  firstName: "Anna",
  lastName: "Eloisie",
  concept: "A story written by us.",
  opening: "There is a whole world in loving you.",
  beginLabel: "Begin our story",
  /** PLACEHOLDER — your name, used in the letter signature and the finale. */
  from: "[ your name ]",
};

/** Chapter metadata: used by the progress rail and section headers. */
export const chapters = [
  { id: "introduction", number: "00", title: "The Introduction", tone: "light" },
  { id: "beginning", number: "01", title: "The Beginning", tone: "light" },
  { id: "our-story", number: "02", title: "Our Story", tone: "light" },
  { id: "little-things", number: "03", title: "The Little Things", tone: "light" },
  { id: "why-i-love-you", number: "04", title: "Why I Love You", tone: "light" },
  { id: "our-universe", number: "05", title: "Our Universe", tone: "dark" },
  { id: "letter", number: "06", title: "A Letter For You", tone: "light" },
  { id: "forever", number: "07", title: "Forever Starts Here", tone: "dark" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

/* ---------------------------- CHAPTER 01 -------------------------------- */
export const beginning = {
  headline: "Every story has a beginning.",
  /** Lines that replace each other while the scene is pinned. */
  lines: [
    "Some begin with a glance.",
    "Some begin with a word.",
    "Ours began with you.",
  ],
  photos: { main: photos.p01, left: photos.p02, right: photos.p03, small: photos.p04 },
  choreography: { topLeft: photos.p05, topRight: photos.p06, bottomLeft: photos.p07, bottomRight: photos.p08 },
  choreographyCaption: "And slowly, everything found its place.",
};

/* ---------------------------- CHAPTER 02 -------------------------------- */
/** PLACEHOLDER timeline — every date and description must be replaced. */
export const timeline = {
  headline: "Little moments, one beautiful story.",
  entries: [
    { date: "[ DD · MM · YYYY ]", title: "[ The day we met ]", text: "[ Describe this memory — where you were, what you felt. ]", photo: photos.p09 },
    { date: "[ DD · MM · YYYY ]", title: "[ Our first conversation ]", text: "[ A line about the moment you knew it was different. ]", photo: photos.p10 },
    { date: "[ DD · MM · YYYY ]", title: "[ Our first date ]", text: "[ The place, the weather, the detail you still remember. ]", photo: photos.p11 },
    { date: "[ DD · MM · YYYY ]", title: "[ A trip together ]", text: "[ Somewhere you went, something you discovered. ]", photo: photos.p12 },
    { date: "[ DD · MM · YYYY ]", title: "[ A quiet ordinary day ]", text: "[ An ordinary day that became extraordinary. ]", photo: photos.p13 },
    { date: "[ DD · MM · YYYY ]", title: "[ Today ]", text: "[ Where you are now, and what comes next. ]", photo: photos.p14 },
  ],
};

/* ---------------------------- CHAPTER 03 -------------------------------- */
export const littleThings = {
  headline: "The little things are everything.",
  morphIntro: "The little things are everything.",
  morphTitle: "Collected, one by one.",
  morphText: "[ A short line about the small moments you keep. ]",
  morphPhotos: pick(20, 2),
  zoom: pick(7, 4),
  table: pick(9, 8),
  accordion: [
    { photo: photos.p03, title: "[ Mornings ]", text: "[ A tiny ritual only you two share. ]" },
    { photo: photos.p06, title: "[ Her laugh ]", text: "[ Something that always makes you smile. ]" },
    { photo: photos.p09, title: "[ Small notes ]", text: "[ A detail that would mean nothing to anyone else. ]" },
    { photo: photos.p12, title: "[ Late walks ]", text: "[ A place that belongs to you both. ]" },
    { photo: photos.p15, title: "[ Coffee ]", text: "[ The way she takes it. ]" },
  ],
  grid: pick(12, 1),
};

/* ---------------------------- CHAPTER 04 -------------------------------- */
/** Easily editable reasons. These are PROVISIONAL examples. */
export const reasons = {
  headline: "There are a thousand reasons.",
  items: [
    "Your smile.",
    "The way you make ordinary days special.",
    "The little things only I notice.",
    "The person you are.",
  ],
  closing: "And a thousand more.",
};

/* ---------------------------- CHAPTER 05 -------------------------------- */
export const universe = {
  headline: "And this is only the beginning.",
  lines: ["Every star,", "every night,", "every tomorrow —", "with you."],
  gallery: pick(14, 3),
  touchLine: "Move the light. Click to change its colour.",
};

/* ---------------------------- CHAPTER 06 -------------------------------- */
export const letterIntro = {
  headline: "One last thing...",
  cta: "Open the letter",
};

/* ---------------------------- CHAPTER 07 -------------------------------- */
export const forever = {
  headline: "To be continued...",
  photo: photos.finale,
  replay: "Relive our story",
};

/* ---------------------------- MUSIC ------------------------------------- */
/**
 * Background music. Drop an mp3 at /public/audio/our-song.mp3 (or change the
 * path). It only starts after "Begin our story" is clicked.
 */
export const music = {
  src: "/audio/our-song.mp3",
  title: "[ Our song — add /public/audio/our-song.mp3 ]",
  volume: 0.35,
};
