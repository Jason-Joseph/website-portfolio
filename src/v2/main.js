import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import content from "../content.ts";

gsap.registerPlugin(ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const { profile, about, stats, signal, experience, education, skills, projects, contact } = content;
// Motion is on by default; only the explicit toggle reduces it.
let reduced = false;
const isPhone = () => innerWidth <= 900;

// ===========================================================================
// Content
// ===========================================================================
// The hero line is already in the HTML (baked in at build); only rewrite a field
// if it differs, so the browser never repaints the largest text a second time.
const fill = (sel, text) => { const el = $(sel); if (el.textContent !== text) el.textContent = text; };
fill('[data-f="name"]', profile.name);
fill('[data-f="title"]', profile.title);
fill('[data-f="loc"]', contact.location);
fill('[data-f="tagline"]', profile.tagline);
for (const k of ["mail", "mail2"]) $(`[data-f="${k}"]`).href = `mailto:${contact.email}`;
$('[data-f="linkedin"]').href = contact.linkedin;
$('[data-f="lead"]').textContent = about.lead;
$('[data-f="body"]').textContent = about.body;
$('[data-f="availability"]').textContent = contact.availability;
$('[data-f="story-title"]').textContent = projects.find((p) => p.story).title;
const pimg = $('[data-f="portrait"]'); pimg.src = profile.photoPath; pimg.alt = `Portrait of ${profile.name}`;

const glyph = (kind) => kind === "cluster"
  ? '<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><g fill="#3e6fd8"><circle cx="12" cy="13" r="3.2"/><circle cx="17" cy="10" r="2.6"/><circle cx="14" cy="18" r="2.8"/></g><g fill="#e8735a"><circle cx="27" cy="26" r="3.2"/><circle cx="31" cy="21" r="2.6"/><circle cx="25" cy="31" r="2.8"/></g></svg>'
  : '<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><path d="M6 33L34 8" stroke="#e8735a" stroke-width="2.2" stroke-linecap="round"/><g fill="#3e6fd8"><circle cx="9" cy="28" r="2.6"/><circle cx="15" cy="27" r="2.6"/><circle cx="20" cy="20" r="2.6"/><circle cx="25" cy="18" r="2.6"/><circle cx="31" cy="11" r="2.6"/></g></svg>';
const thumbOf = (src) => src.replace("/projects/", "/thumbs/").replace(/\.\w+$/, ".webp");
// Intrinsic logo sizes (26 px tall in the layout) so the page never shifts as they load.
const LOGO_W = { "/logos/kpay.svg": 61, "/logos/bca.svg": 83, "/logos/lse.svg": 26, "/logos/nus.png": 57 };
const logoImg = (src, alt) => `<img class="logo" src="${esc(src)}" alt="${esc(alt)}" width="${LOGO_W[src] ?? 26}" height="26" decoding="async" />`;
function workItem(p) {
  const ext = p.link.startsWith("http");
  const go = p.link.startsWith("mailto:") ? "Ask for a demo" : p.link === "#top" ? "You're on it" : /\.(ipynb|R)$/.test(p.link) ? "Open the code" : p.link.endsWith(".pdf") ? "Open the dashboard" : "Open it";
  const href = p.link === "#top" ? "#hero" : p.link;
  const thumb = p.image
    ? `<div class="thumb"><img src="${esc(thumbOf(p.image))}" alt="${esc(p.imageAlt ?? p.title)}" width="176" height="176" loading="lazy" decoding="async" /></div>`
    : `<div class="thumb glyph">${glyph(p.tags.includes("Clustering") ? "cluster" : "regress")}</div>`;
  return `<article>${thumb}<div>
    <h3>${esc(p.title)}${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}</h3>
    <p>${esc(p.description)}</p>
    <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    <a class="go" href="${esc(href)}" ${ext ? 'target="_blank" rel="noreferrer"' : ""}>${go} ${ext ? "↗" : "→"}</a>
  </div></article>`;
}
const dataP = projects.filter((p) => p.kind === "data" && !p.story);
const aiP = projects.filter((p) => p.kind === "ai");
$("#data-work").innerHTML = dataP.map(workItem).join("");
$("#ai-work").innerHTML = aiP.map(workItem).join("");
$("#xp").innerHTML = experience.map((x) => `<article>
  ${logoImg(x.logo, `${x.company} logo`)}
  <h3>${esc(x.company)}</h3><p class="when">${esc(x.role)}</p><p class="when">${esc(x.location)} · ${esc(x.dates)}</p>
  <ul>${x.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></article>`).join("");
$("#edu").innerHTML = education.map((e) => `<article>
  ${logoImg(e.logo, `${e.institution} logo`)}
  <h3>${esc(e.institution)}</h3><p>${esc(e.degree)}</p><p class="when">${esc(e.dates)}</p><p class="muted" style="margin-top:.3rem;font-size:.92rem">${esc(e.details)}</p></article>`).join("");
$("#stats").innerHTML = stats.map((s) => `<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join("");
$("#skills").innerHTML = skills.map((s) => `<p><b>${esc(s.category)}</b>${s.items.map(esc).join(" · ")}</p>`).join("");
$("#rail").innerHTML = [
  ["Email", `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`],
  ["Phone", `<a href="tel:${esc(contact.phone.replace(/\s/g, ""))}">${esc(contact.phone)}</a>`],
  ["LinkedIn", `<a href="${esc(contact.linkedin)}" target="_blank" rel="noreferrer">in/jasontjiadi ↗</a>`],
  ["GitHub", `<a href="${esc(contact.github)}" target="_blank" rel="noreferrer">Jason-Joseph ↗</a>`],
  ["Location", `<strong>${esc(contact.location)}</strong>`],
].map(([k, v]) => `<li><span>${k}</span>${v}</li>`).join("");

const stops = [...document.querySelectorAll(".stop")];
$("#stops").innerHTML = stops.map((s) => `<a href="#${s.id}" data-label="${esc(s.dataset.label)}" aria-label="${esc(s.dataset.label)}"><span></span></a>`).join("");

// ---- The Signal card ------------------------------------------------------------
const days = signal.days, worst = days[signal.worstIndex], best = days[signal.bestIndex];
const dayName = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
$("#mini").innerHTML = days.map((d, i) => `<button type="button" class="${i === signal.worstIndex ? "worst" : ""} ${i === signal.bestIndex ? "best" : ""}" data-i="${i}" data-h="${(d.minutes / signal.axisMax) * 100}" aria-label="${dayName[d.day]}, ${d.minutes.toFixed(1)} minutes"><span>${d.minutes.toFixed(1)}</span><b>${d.day}</b></button>`).join("");
$("#axis-top").textContent = `${signal.axisMax} min`;
$("#method").textContent = signal.method;
$("#notebook").href = signal.notebook;
$("#sr-table").innerHTML = `<caption>Average total flight delay by day of week, from ${signal.totalFlights.toLocaleString("en-US")} US domestic flights, 2002 to 2003</caption><tbody>${days.map((d) => `<tr><th scope="row">${d.day}</th><td>${d.minutes.toFixed(1)} minutes</td></tr>`).join("")}</tbody>`;
const beats = [
  { cap: "Two years of US domestic aviation.", num: `<span id="ctr">0</span><small>flights</small>` },
  { cap: "Average total delay, <em>by day of week</em>. Every tower in the city is to scale.", num: `0–${signal.axisMax}<small>minutes, from a zero baseline</small>` },
  { cap: `${dayName[worst.day]} is the worst day to fly.`, num: `${worst.minutes.toFixed(1)}<small>minutes on ${dayName[worst.day]}</small>` },
  { cap: `${dayName[best.day]} is calmest. <em>By six minutes.</em> The day barely matters. That's the finding.`, num: `${best.minutes.toFixed(1)}<small>minutes on ${dayName[best.day]}</small>` },
];
$("#steps").innerHTML = beats.map((_, i) => `<button type="button" aria-pressed="false" aria-label="Step ${i + 1} of 4">${i + 1}</button>`).join("");
let beat = -1, beatTimer = null;
const onBeat = [];
function paintBars(state, focus = -1) {
  $("#mini").dataset.beat = state;
  document.querySelectorAll("#mini button").forEach((b, i) => {
    b.style.height = state === "0" ? "0" : `${b.dataset.h}%`;
    b.classList.toggle("focus", i === focus);
  });
}
function setBeat(n) {
  beat = n;
  $("#beat").innerHTML = beats[n].cap;
  $("#num").innerHTML = beats[n].num;
  paintBars(String(n));
  document.querySelectorAll("#steps button").forEach((b, i) => b.setAttribute("aria-pressed", String(i === n)));
  onBeat.forEach((f) => f({ beat: n }));
  if (n === 0) {
    const el = $("#ctr");
    if (reduced) { el.textContent = signal.totalFlights.toLocaleString("en-US"); return; }
    const o = { v: 0 };
    gsap.to(o, { v: signal.totalFlights, duration: 1.6, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("en-US"); } });
  }
}
// Focus one day: the chart bar and its tower light up together.
function focusDay(i) {
  clearInterval(beatTimer);
  beat = 3;
  const d = days[i];
  $("#beat").innerHTML = `${dayName[d.day]}: <em>${d.minutes.toFixed(1)} minutes</em> of average total delay.`;
  $("#num").innerHTML = `${d.minutes.toFixed(1)}<small>minutes on ${dayName[d.day]}</small>`;
  paintBars("focus", i);
  document.querySelectorAll("#steps button").forEach((b) => b.setAttribute("aria-pressed", "false"));
  onBeat.forEach((f) => f({ focus: i }));
}
$("#steps").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  clearInterval(beatTimer); setBeat([...b.parentNode.children].indexOf(b));
});
$("#mini").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) focusDay(Number(b.dataset.i)); });
function playBeats() {
  if (beat !== -1) return;
  if (reduced) return setBeat(3);
  setBeat(0);
  beatTimer = setInterval(() => (beat >= 3 ? clearInterval(beatTimer) : setBeat(beat + 1)), 2800);
}

// ---- smooth scroll ---------------------------------------------------------------
const lenis = new Lenis({ duration: 1.25, easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)), smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
const goTo = (id) => lenis.scrollTo(id, { duration: reduced ? 0 : 1.8, easing: (x) => 1 - Math.pow(1 - x, 4) });
document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
  const id = a.getAttribute("href");
  if (id.length < 2) return;
  e.preventDefault(); goTo(id);
}));

// Cards rise into place: one restrained move each.
document.querySelectorAll(".card").forEach((c, i) => {
  // The hero card is visible from the first paint (it is the largest content); it only settles into place.
  if (i === 0) return gsap.from(c, { y: 18, duration: 1, ease: "power3.out" });
  gsap.from(c, { opacity: 0, y: 46, duration: 1, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 88%" } });
});

// ===========================================================================
// The city
// ===========================================================================
const canvas = $("#world");
let world = null;
function noGL() {
  document.documentElement.classList.add("no-gl");
  ScrollTrigger.create({ trigger: "#signal", start: "top 60%", once: true, onEnter: playBeats });
}
// The page is readable first; the 3D city (three.js) loads once the browser is idle.
function startCity() {
  import("../city/world.js")
    .then(({ startWorld }) => startWorld({ canvas, $, esc, days, dayName, signal, onBeat, focusDay, goTo, playBeats, stops, isPhone, isReduced: () => reduced }))
    .then((w) => { world = w; if (!w) noGL(); })
    .catch((err) => { console.error("The 3D city could not start:", err); noGL(); });
}
const whenIdle = (fn) => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
// Phones start the city on the first touch or scroll, or after a few seconds,
// so the page is readable and responsive first; the poster shows the city meanwhile.
function scheduleCity() {
  if (!isPhone()) return whenIdle(startCity);
  const events = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"];
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    events.forEach((e) => removeEventListener(e, go));
    whenIdle(startCity);
  };
  events.forEach((e) => addEventListener(e, go, { passive: true }));
  setTimeout(go, 3500);
}
if (document.readyState === "complete") scheduleCity();
else addEventListener("load", scheduleCity, { once: true });

// The footer toggle is the only way to reduce motion; it works with or without WebGL.
$("#motion").addEventListener("click", (e) => {
  reduced = !reduced;
  document.documentElement.classList.toggle("reduced", reduced);
  world?.rebuild();
  if (reduced && beat !== 3) { clearInterval(beatTimer); setBeat(3); }
  e.currentTarget.textContent = reduced ? "Enable motion" : "Reduce motion";
});
