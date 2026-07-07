// ---------------------------------------------------------------------------
// App.tsx
// Composition root. The three.js backdrop sits fixed behind everything;
// sections stack above it. `ready` flips when the preloader finishes and
// gates the hero/nav entrances + scroll reveals.
// ---------------------------------------------------------------------------

import { lazy, Suspense, useState } from "react";
import { useLenis } from "./lib/useLenis";
import { useReveals } from "./lib/useReveals";
import { useSpotlight } from "./lib/useSpotlight";

// three.js + @react-three/fiber are by far the heaviest imports — split
// them into their own chunk so first paint isn't waiting on the backdrop.
const Silk = lazy(() => import("./three/Silk"));
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
      <Suspense fallback={<div className="backdrop backdrop-fallback" aria-hidden="true" />}>
        <Silk />
      </Suspense>
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
