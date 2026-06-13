// ---------------------------------------------------------------------------
// Nav.tsx
// Slim fixed bar: monogram, anchor links, contact CTA. Fades in after the
// preloader; gains a glass backdrop once the page has been scrolled.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { gsap, motionPref } from "../lib/motion";
import content from "../content";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
] as const;

export default function Nav({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!ready || !root.current) return;
    if (motionPref.reduced) {
      gsap.set(root.current, { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      root.current,
      { autoAlpha: 0, y: -16 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 },
    );
  }, [ready]);

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`} ref={root}>
      <a className="nav-mark" href="#top" aria-label="Back to top">
        JJT<span className="nav-mark-dot" aria-hidden="true" />
      </a>
      <nav aria-label="Primary">
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <a className="nav-cta" href={`mailto:${content.contact.email}`}>
        Get in touch
      </a>
    </header>
  );
}
