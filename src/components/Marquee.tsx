// ---------------------------------------------------------------------------
// Marquee.tsx
// Infinite skills ticker between hero and work. Two identical tracks slide
// via a CSS animation (cheap, compositor-only); paused entirely under
// reduced motion, where it just shows the first row statically.
// ---------------------------------------------------------------------------

import content from "../content";

export default function Marquee() {
  const row = content.marquee;
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <ul className="marquee-row" key={dup}>
            {row.map((item) => (
              <li key={item}>
                {item}
                <span className="marquee-dot" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
