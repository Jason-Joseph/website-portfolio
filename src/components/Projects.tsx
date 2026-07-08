// ---------------------------------------------------------------------------
// Projects.tsx
// Selected work: the first FEATURED_PROJECTS get full editorial rows, then
// a single glass card points at the GitHub projects page for everything
// else. Whole rows are links.
// ---------------------------------------------------------------------------

import content, { FEATURED_PROJECTS, type ProjectItem } from "../content";

function Arrow({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function Projects() {
  const featured: ProjectItem[] = content.projects.slice(0, FEATURED_PROJECTS);

  return (
    <section className="section projects" id="work">
      <span className="ghost-no" data-parallax="0.22" aria-hidden="true">
        01
      </span>
      <div className="container">
        <p className="label">
          <em>01</em> Selected work
        </p>
        <h2 className="display section-title" data-lines data-drift="0.6">
          <span className="reveal-line">
            <span className="reveal-inner">
              Projects, from <i>raw data</i>
            </span>
          </span>
          <span className="reveal-line">
            <span className="reveal-inner">to the final call.</span>
          </span>
        </h2>

        <ul className="project-list" data-reveal-group data-skew>
          {featured.map((p) => (
            <li key={p.index} data-reveal>
              <a
                className="project-row"
                href={p.link}
                target="_blank"
                rel="noreferrer"
                data-cursor
                data-spotlight
              >
                <span className="project-No">{p.index}</span>
                {p.image && (
                  <span className="project-thumb">
                    <img src={p.image} alt={p.imageAlt ?? `${p.title} preview`} loading="lazy" />
                  </span>
                )}
                <span className="project-main">
                  <span className="project-title">{p.title}</span>
                  <span className="project-desc">{p.description}</span>
                </span>
                <span className="project-side">
                  <span className="project-tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                  <Arrow />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <a
          className="github-card border-beam"
          href="https://github.com/Jason-Joseph/Projects"
          target="_blank"
          rel="noreferrer"
          data-cursor
          data-reveal
          data-spotlight
        >
          <span className="github-card-text">
            <strong className="display">
              More on <i>GitHub</i>
            </strong>
            <span>Notebooks, models, and the occasional rabbit hole.</span>
          </span>
          <span className="github-card-arrow">
            <Arrow size={26} />
          </span>
        </a>
      </div>
    </section>
  );
}
