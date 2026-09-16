// ---------------------------------------------------------------------------
// Signal.tsx
// "The Signal" — the scroll-driven data story. The section pins while four
// beats resolve: the scale of the dataset, its shape, the worst day, then the
// honest payoff (the spread is only ~6 minutes, and that IS the finding).
//
// Beat state lives in React (it changes four times, not every frame); only the
// running flight counter is written per-frame from the ScrollTrigger, straight
// to the DOM, so scrubbing never thrashes the render tree.
//
// The chart is deliberately drawn from a TRUE ZERO BASELINE. The bars come out
// nearly level — that is the finding, not a bug. Never truncate the axis here.
// ---------------------------------------------------------------------------

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, motionPref } from "../lib/motion";
import content from "../content";

const { totalFlights, days, worstIndex, bestIndex, axisMax, method, notebook } = content.signal;

const CAPTIONS = [
  <>Two years of US domestic aviation.</>,
  <>
    Average total delay, <i>by day of week.</i>
  </>,
  <>Friday is the worst day to fly.</>,
  <>
    Saturday is calmest. <i>By six minutes.</i>
    <small>The day barely matters. That&rsquo;s the finding.</small>
  </>,
];

/** Beat boundaries as a fraction of the pinned scroll. */
function beatFor(progress: number): number {
  if (progress < 0.23) return 0;
  if (progress < 0.5) return 1;
  if (progress < 0.75) return 2;
  return 3;
}

export default function Signal({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  // Reduced motion opens on the resolved state — the whole story, no movement.
  const [beat, setBeat] = useState(() => (motionPref.reduced ? 3 : 0));

  useLayoutEffect(() => {
    if (!ready || motionPref.reduced) return;

    const ctx = gsap.context(() => {
      const apply = (progress: number) => {
        setBeat(beatFor(progress));
        // The count races ahead of the first beat so it lands before the bars.
        if (counter.current && progress < 0.23) {
          const frac = Math.min(1, progress / 0.19);
          counter.current.textContent = Math.round(totalFlights * frac).toLocaleString("en-US");
        }
      };

      const mm = gsap.matchMedia();

      // Desktop: pin the section and scrub the four beats through the hold.
      mm.add("(min-width: 901px)", () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=140%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => apply(self.progress),
        });
      });

      // Mobile: no pin — the beats play once as a timed sequence on entry.
      mm.add("(max-width: 900px)", () => {
        const state = { p: 0 };
        gsap.to(state, {
          p: 1,
          duration: 4.6,
          ease: "none",
          onUpdate: () => apply(state.p),
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [ready]);

  const worst = days[worstIndex].minutes.toFixed(1);
  const best = days[bestIndex].minutes.toFixed(1);

  return (
    <div className="signal" id="signal" ref={root}>
      <p className="signal-eyebrow">
        <span>Featured analysis</span> Airline delays, 2002&ndash;2003
      </p>

      <div className="signal-stage" data-beat={beat}>
          <div className="signal-row">
            <h2 className="display signal-cap">{CAPTIONS[beat]}</h2>
            <p className="signal-num">
              <span className="signal-num-value">
                {beat === 0 ? (
                  <span ref={counter}>0</span>
                ) : beat === 1 ? (
                  totalFlights.toLocaleString("en-US")
                ) : beat === 2 ? (
                  worst
                ) : (
                  best
                )}
              </span>
              <span className="signal-num-label">
                {beat <= 1
                  ? "flights analysed"
                  : beat === 2
                    ? "minutes on friday"
                    : "minutes on saturday"}
              </span>
            </p>
          </div>

          <div className="signal-plot">
            <div className="signal-grid" aria-hidden="true">
              {[0, axisMax / 2, axisMax].map((v) => (
                <span key={v} style={{ bottom: `${(v / axisMax) * 100}%` }}>
                  <b>{v}</b>
                </span>
              ))}
            </div>
            <ul className="signal-cols">
              {days.map((d, i) => {
                const shown = beat >= 1;
                const hot = beat === 2 && i === worstIndex;
                const cool = beat === 3 && i === bestIndex;
                return (
                  <li className="signal-col" key={d.day}>
                    <span className="signal-val" data-on={shown} data-lit={hot || cool}>
                      {d.minutes.toFixed(1)}
                    </span>
                    <span
                      className="signal-bar"
                      data-hot={hot}
                      data-cool={cool}
                      data-dim={beat >= 2 && !hot && !cool}
                      style={{ height: shown ? `${(d.minutes / axisMax) * 100}%` : "0%" }}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="signal-axis" aria-hidden="true">
            {days.map((d, i) => (
              <li
                key={d.day}
                data-lit={(beat === 2 && i === worstIndex) || (beat === 3 && i === bestIndex)}
              >
                {d.day}
              </li>
            ))}
          </ul>

          {/* Screen readers get the whole finding as a table, not as beats.
              The WRAPPER carries .sr-only, not the table: a table's used width
              can never fall below its min-content width, so width:1px is
              ignored, the table stays ~685px wide, and it widens the whole
              document on a phone. A block container clips it properly. */}
          <div className="sr-only">
            <table>
              <caption>
                Average total flight delay by day of week, from{" "}
                {totalFlights.toLocaleString("en-US")} US domestic flights, 2002 to 2003
              </caption>
              <tbody>
                {days.map((d) => (
                  <tr key={d.day}>
                    <th scope="row">{d.day}</th>
                    <td>{d.minutes.toFixed(1)} minutes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="signal-foot" data-on={beat === 3}>
            <p className="signal-method">{method}</p>
            <a href={notebook} target="_blank" rel="noreferrer" data-cursor>
              See the notebook
            </a>
          </div>
        </div>
      </div>
  );
}
