# ANNA ELOISIE — An immersive love experience

*"A story written by us."* — Vite · React 18 · TypeScript · Tailwind v4 · GSAP + ScrollTrigger + SplitText · Framer Motion · Lenis

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/ (site estático, publique em Vercel/Netlify/etc.)
```

## Onde editar o conteúdo

| O quê | Arquivo |
|---|---|
| Textos, capítulos, fotos, datas, linha do tempo, motivos, música | `src/content/story.ts` |
| A carta (Capítulo 06) | `src/content/letter.ts` |
| Fotos reais | `public/photos/` → referencie como `/photos/arquivo.jpg` |
| Música | `public/audio/our-song.mp3` |

Tudo entre `[ colchetes ]` é provisório. `USE_STOCK_PHOTOS = false` mostra só os placeholders locais identificados.

## Estrutura

```
src/
  content/            dados editáveis (story.ts, letter.ts)
  sections/           os 8 capítulos narrativos
  components/ui/      componentes do 21st.dev (adaptados)
  components/experience/  sistema: smooth scroll, cursor, áudio, lightbox, rail, grão, partículas
  lib/gsap.ts         registro de plugins, breakpoints, whenFontsReady
  hooks/              media queries / in-view
```

## Sistema de scroll
Um único sistema: **Lenis** move o scroll nativo da janela e é atualizado pelo ticker do GSAP;
ScrollTrigger e `useScroll` do Framer Motion leem a mesma posição. Nenhum componente sequestra
wheel/touch — o visitante sempre pode avançar e voltar. `prefers-reduced-motion` desliga Lenis,
pins e scrubs e mostra o conteúdo estático.

## Componentes do 21st.dev e adaptações
- **Scroll Media Expansion Hero** — trocado o sequestro de wheel/`scrollTo(0,0)` por progresso via sticky + `useScroll`; `next/image` → `<img>`.
- **Scroll Choreography** — tamanhos responsivos, legenda no quadro final.
- **Scroll Morph Hero** — scroll virtual derivado do scroll real da página; intro inicia ao entrar na tela.
- **Zoom Parallax** — legenda central revelada pelo zoom; Lenis local removido (já é global).
- **Parallax Grid Scroll** — usa o scroll da página (sem container interno com scroll).
- **Reveal Text** — suporte a ScrollTrigger e espera das fontes.
- **Silky Moving Background** — recolorido (noite/espresso/vinho/rosa/bege).
- **Orb Flow Background** — cores champagne/rosa, pausa fora da tela.
- **3D Parallax Unfurling Gallery** — scroll da página, 3D suavizado no celular.
- **Cursor Effects (Neon Flow)** — paleta quente, carregado sob demanda, fallback para o Orb se a CDN falhar.
