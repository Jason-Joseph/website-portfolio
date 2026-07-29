// ---------------------------------------------------------------------------
// Experience.tsx
// Career timeline as ruled editorial rows — institution logo in a glass
// chip (greyscale until the row is hovered), company set large in serif,
// role/dates in the margin, highlights as a quiet list. Education follows
// in glass cards with the same chip treatment.
// ---------------------------------------------------------------------------

import content from "../content";

export default function Experience() {
  return (
    <section className="section experience" id="experience">
      <span className="ghost-no" data-parallax="0.22" aria-hidden="true">
        03
      </span>
      <div className="container">
        <p className="label">
          <em>03</em> Experience
        </p>

        <ol className="xp-list">
          {content.experience.map((xp) => (
            <li className="xp-row" key={xp.company} data-reveal-group>
              <div className="xp-meta" data-reveal>
                <span className="xp-dates">{xp.dates}</span>
                <span className="xp-role">{xp.role}</span>
                <span className="xp-loc">{xp.location}</span>
              </div>
              <div className="xp-main">
                <h3 className="display xp-company" data-reveal>
                  <span className="logo-chip">
                    <img src={xp.logo} alt={`${xp.shortName} logo`} loading="lazy" />
                  </span>
                  <span className="xp-company-text">
                    {xp.shortName}
                    <span className="xp-company-full">{xp.company}</span>
                  </span>
                </h3>
                <ul className="xp-points">
                  {xp.highlights.map((h, i) => (
                    <li key={i} data-reveal>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="edu" data-reveal-soft-group>
          <p className="edu-label" data-reveal-soft>
            Education
          </p>
          <div className="edu-grid">
            {content.education.map((ed) => (
              <article className="edu-card" key={ed.institution} data-reveal-soft>
                <span className="logo-chip logo-chip-lg">
                  <img src={ed.logo} alt={`${ed.institution} logo`} loading="lazy" />
                </span>
                <h3>{ed.institution}</h3>
                <p className="edu-degree">{ed.degree}</p>
                <p className="edu-detail">
                  {ed.dates} · {ed.details}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
