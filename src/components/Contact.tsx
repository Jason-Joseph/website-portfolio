// ---------------------------------------------------------------------------
// Contact.tsx
// Closing statement: giant serif invitation, email CTA, contact rail, and
// the small-print footer with a live Singapore clock.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { motionPref, setMotionEnabled } from "../lib/motion";
import content from "../content";

function useSingaporeTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Singapore",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Contact() {
  const time = useSingaporeTime();
  const year = new Date().getFullYear();

  return (
    <section className="section contact" id="contact">
      <span className="ghost-no" data-parallax="0.22" aria-hidden="true">
        04
      </span>
      <div className="container">
        <p className="label">
          <em>04</em> Contact
        </p>

        <h2 className="display contact-title" data-lines data-drift="-0.5">
          <span className="reveal-line">
            <span className="reveal-inner">Have data worth</span>
          </span>
          <span className="reveal-line">
            <span className="reveal-inner">
              <i>a closer look?</i>
            </span>
          </span>
        </h2>

        <div className="contact-cta-row" data-reveal>
          <a className="contact-cta" href={`mailto:${content.contact.email}`} data-cursor>
            {content.contact.email}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
          <a className="contact-cta" href="/Jason-Joseph-Tjiadi-CV.pdf" download data-cursor>
            Download CV
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
          <p className="contact-availability">{content.contact.availability}</p>
        </div>

        <ul className="contact-rail" data-reveal-group>
          <li data-reveal>
            <span>LinkedIn</span>
            <a href={content.contact.linkedin} target="_blank" rel="noreferrer">
              in/jasontjiadi
            </a>
          </li>
          <li data-reveal>
            <span>GitHub</span>
            <a href={content.contact.github} target="_blank" rel="noreferrer">
              Jason-Joseph
            </a>
          </li>
          <li data-reveal>
            <span>Phone</span>
            <a href={`tel:${content.contact.phone.replace(/\s/g, "")}`}>{content.contact.phone}</a>
          </li>
          <li data-reveal>
            <span>Based in</span>
            <span className="contact-loc">
              {content.contact.location}
              {time && <em> — {time} SGT</em>}
            </span>
          </li>
        </ul>
      </div>

      <footer className="footer">
        <div className="container footer-row">
          <span>
            © {year} {content.profile.name}
          </span>
          <span className="footer-built">Designed &amp; built with three.js + GSAP</span>
          <button
            type="button"
            className="footer-motion"
            onClick={() => setMotionEnabled(motionPref.reduced)}
          >
            {motionPref.reduced ? "Enable motion" : "Reduce motion"}
          </button>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </section>
  );
}
