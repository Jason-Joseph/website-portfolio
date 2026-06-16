// ---------------------------------------------------------------------------
// App.tsx
// Composition root. The three.js backdrop sits fixed behind everything;
// sections stack above it. `ready` flips when the preloader finishes and
// gates the hero/nav entrances + scroll reveals.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { useLenis } from "./lib/useLenis";
import { useReveals } from "./lib/useReveals";
import { useSpotlight } from "./lib/useSpotlight";
import Silk from "./three/Silk";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Projects from "./components/Projects";
import About from "./components/About";
import Experience from "./components/Experience";
import Contact from "./components/Contact";

export default function App() {
  const [ready, setReady] = useState(false);
  useLenis();
  useReveals(ready);
  useSpotlight(ready);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Silk />
      <Cursor />

      <Nav ready={ready} />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Projects />
        <About ready={ready} />
        <Experience />
        <Contact />
      </main>
    </>
  );
}
