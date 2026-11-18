// Generates on-palette, clearly-labelled placeholder "photographs".
// Run: node scripts/make-placeholders.mjs
import { writeFileSync, mkdirSync } from "node:fs";
const out = new URL("../public/photos/placeholders/", import.meta.url);
mkdirSync(out, { recursive: true });
const P = { cream: "#F4EFE6", beige: "#E5D8C8", rose: "#B98687", wine: "#793D4A", esp: "#302824", champ: "#B39A72" };
const schemes = [
  [P.esp, P.wine, P.champ], [P.beige, P.rose, P.cream], [P.wine, P.rose, P.champ], [P.esp, P.champ, P.cream],
  [P.rose, P.beige, P.wine], [P.champ, P.cream, P.rose], [P.esp, P.rose, P.beige], [P.wine, P.esp, P.champ],
  [P.beige, P.champ, P.wine], [P.cream, P.rose, P.esp], [P.esp, P.wine, P.rose], [P.rose, P.wine, P.cream],
  [P.champ, P.esp, P.beige], [P.wine, P.champ, P.cream], [P.beige, P.esp, P.rose], [P.esp, P.beige, P.wine],
  [P.rose, P.champ, P.esp], [P.cream, P.wine, P.champ],
];
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
schemes.forEach(([a, b, c], i) => {
  const n = String(i + 1).padStart(2, "0");
  const dark = [P.esp, P.wine].includes(a);
  const ink = dark ? P.cream : P.esp;
  const blobs = Array.from({ length: 3 }, (_, k) => {
    const cx = 15 + rnd() * 70, cy = 15 + rnd() * 70, r = 25 + rnd() * 35;
    return `<radialGradient id="g${k}" cx="${cx}%" cy="${cy}%" r="${r}%"><stop offset="0" stop-color="${k === 1 ? c : b}" stop-opacity="${0.75 - k * 0.15}"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="${rnd() > 0.5 ? 1 : 0.3}" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
${blobs}
<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${P.esp}" stop-opacity="0.55"/></radialGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.35 0"/></filter>
</defs>
<rect width="1200" height="1500" fill="url(#bg)"/>
<rect width="1200" height="1500" fill="url(#g0)"/><rect width="1200" height="1500" fill="url(#g1)"/><rect width="1200" height="1500" fill="url(#g2)"/>
<rect width="1200" height="1500" fill="url(#vig)"/>
<rect width="1200" height="1500" filter="url(#grain)" opacity="0.55"/>
<rect x="60" y="60" width="1080" height="1380" fill="none" stroke="${ink}" stroke-opacity="0.28" stroke-width="2"/>
<g font-family="Georgia, 'Cormorant Garamond', serif" fill="${ink}">
<text x="100" y="1330" font-size="120" font-style="italic" opacity="0.55">${n}</text>
</g>
<g font-family="Helvetica, Arial, sans-serif" font-size="22" fill="${ink}" opacity="0.5" letter-spacing="4">
<text x="100" y="1385">PHOTO PLACEHOLDER · replace in src/content/story.ts</text>
<text x="90" y="110">AE · ${n}</text><text x="1110" y="110" text-anchor="end">KODAK PORTRA 400 · ${n}A</text>
</g>
</svg>`;
  writeFileSync(new URL(`photo-${n}.svg`, out), svg);
});
console.log("placeholders:", schemes.length);
