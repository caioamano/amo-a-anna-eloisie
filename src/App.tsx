import { SmoothScroll } from "@/components/experience/smooth-scroll";
import { LightboxProvider } from "@/components/experience/lightbox";
import { AudioProvider, MusicToggle } from "@/components/experience/audio";
import { Cursor } from "@/components/experience/cursor";
import { ProgressRail, MobileProgress } from "@/components/experience/progress-rail";
import { FilmGrain } from "@/components/experience/film-grain";
import { Introduction } from "@/sections/introduction";
import { Beginning } from "@/sections/beginning";
import { OurStory } from "@/sections/our-story";
import { LittleThings } from "@/sections/little-things";
import { WhyILoveYou } from "@/sections/why-i-love-you";
import { OurUniverse } from "@/sections/our-universe";
import { Letter } from "@/sections/letter";
import { Forever } from "@/sections/forever";

export default function App() {
  return (
    <SmoothScroll>
      <AudioProvider>
        <LightboxProvider>
          <main className="relative">
            <Introduction />
            <Beginning />
            <OurStory />
            <LittleThings />
            <WhyILoveYou />
            <OurUniverse />
            <Letter />
            <Forever />
          </main>
          <ProgressRail />
          <MobileProgress />
          <MusicToggle />
          <Cursor />
          <FilmGrain />
        </LightboxProvider>
      </AudioProvider>
    </SmoothScroll>
  );
}
