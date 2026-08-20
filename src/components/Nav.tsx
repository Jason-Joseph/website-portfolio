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
  // Full-screen link panel for narrow viewports, where .nav-links is hidden.
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!ready || !root.current) return;
    if (motionPref.reduced) {
      gsap.set(root.current, { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      root.current,
      { autoAlpha: 0, y: -16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.5,
        // A lingering transform on <header> makes it the containing block for
        // any position:fixed descendant (the mobile menu panel), collapsing
        // that panel to the header's own small box instead of the viewport.
        clearProps: "transform",
      },
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

      <button
        type="button"
        className="nav-burger"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="nav-mobile-panel"
        data-open={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div id="nav-mobile-panel" className="nav-mobile" data-open={menuOpen} aria-hidden={!menuOpen}>
        <ul className="nav-mobile-links">
          {LINKS.map((l, i) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
                <span className="nav-mobile-index">{`0${i + 1}`}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          className="nav-mobile-cta"
          href={`mailto:${content.contact.email}`}
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
        >
          {content.contact.email}
        </a>
      </div>
    </header>
  );
}
