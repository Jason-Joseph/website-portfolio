// The world: scene, light from golden hour to night, camera, post, interaction,
// the render loop, and the scroll-scrubbed camera glide.
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { HorizontalTiltShiftShader } from "three/addons/shaders/HorizontalTiltShiftShader.js";
import { VerticalTiltShiftShader } from "three/addons/shaders/VerticalTiltShiftShader.js";
import { std, rbox, mesh, instance, cityLights, prepareTextures, mergeStatic } from "./kit.js";
import { buildLand } from "./land.js";
import { buildSkyline } from "./skyline.js";
import { buildLandmarks } from "./landmarks.js";
import { buildSea, DETAIL } from "./sea.js";

gsap.registerPlugin(ScrollTrigger);

// Camera stops; `night` ramps from golden hour (0) through dusk to night (1).
const WP = {
  hero:      { tx: 0,   ty: 3,   tz: 0,   zoom: 0.92, az: 0.785, el: 0.6,  night: 0 },
  signal:    { tx: 18,  ty: 5,   tz: -9,  zoom: 1.5,  az: 0.98,  el: 0.5,  night: 0.1 },
  data:      { tx: -6,  ty: 3,   tz: -16, zoom: 1.6,  az: 0.55,  el: 0.58, night: 0.2 },
  ai:        { tx: -17, ty: 3.5, tz: 3,   zoom: 1.6,  az: 1.15,  el: 0.56, night: 0.3 },
  career:    { tx: 15,  ty: 6,   tz: 24,  zoom: 1.05, az: 0.5,   el: 0.5,  night: 0.45 },
  education: { tx: -18, ty: 5,   tz: 19,  zoom: 1.15, az: 0.95,  el: 0.52, night: 0.6 },
  about:     { tx: 0,   ty: 4.6, tz: 0,   zoom: 2.3,  az: 0.785, el: 0.42, night: 0.72 },
  contact:   { tx: 23,  ty: 3,   tz: 13,  zoom: 1.5,  az: 0.62,  el: 0.42, night: 1 },
};
const C = (h) => new THREE.Color(h);
// Warm key, cool fill: the sun is gold, the sky light that fills the shadows is blue.
const SKY = {
  bg: [C("#e9c39e"), C("#ae979c"), C("#121a31")],
  sun: [C("#ffad62"), C("#ff8a5e"), C("#8ea8ff")],
  hemiSky: [C("#b7cbe0"), C("#a9a3bb"), C("#2a3a66")],
  hemiGround: [C("#6b5848"), C("#3d2f45"), C("#161626")],
  deep: [C("#2c4f63"), C("#364560"), C("#0b172c")],
  shallow: [C("#5e8a9a"), C("#6b7890"), C("#1a2f50")],
};
const SUNPOS = [new THREE.Vector3(55, 22, -8), new THREE.Vector3(48, 12, 18), new THREE.Vector3(18, 58, 26)];
const tri = (arr, t, out) => (t < 0.5 ? out.lerpColors(arr[0], arr[1], t * 2) : out.lerpColors(arr[1], arr[2], (t - 0.5) * 2));
const triN = (a, b, c, t) => (t < 0.5 ? a + (b - a) * t * 2 : b + (c - b) * (t - 0.5) * 2);

const pause = () => new Promise((resolve) => setTimeout(resolve, 0));

// Reflections come from a PMREM environment built in a worker (see envWorker.js).
// Resolves to null if workers, OffscreenCanvas WebGL, or the timeout get in the way;
// the city then renders without sky reflections rather than freezing the page.
function loadEnvironment(timeout = 4000) {
  return new Promise((resolve) => {
    let worker;
    const done = (tex) => { clearTimeout(timer); worker?.terminate(); resolve(tex); };
    const timer = setTimeout(() => done(null), timeout);
    try {
      worker = new Worker(new URL("./envWorker.js", import.meta.url), { type: "module" });
      worker.onmessage = ({ data: m }) => {
        if (m.error) { console.warn("City reflections unavailable:", m.error); return done(null); }
        const tex = new THREE.DataTexture(m.data, m.width, m.height, THREE.RGBAFormat, THREE.HalfFloatType);
        tex.mapping = THREE.CubeUVReflectionMapping;
        tex.minFilter = tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        done(tex);
      };
      worker.onerror = () => done(null);
      worker.postMessage("build");
    } catch {
      done(null);
    }
  });
}

// Software WebGL (no GPU: some low-end devices, remote desktops, and the
// headless browsers that audit page speed) draws every frame on the CPU and
// stalls the page for seconds. Those devices keep the still poster instead.
function softwareGL() {
  try {
    const opts = { failIfMajorPerformanceCaveat: true };
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", opts) || c.getContext("webgl", opts);
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch {
    return true;
  }
}

// Create the renderer and build the city. Returns null when WebGL is unavailable.
// `?gl=full` forces the live city anyway (for testing and capturing the poster).
export async function startWorld(ctx) {
  if (new URLSearchParams(location.search).get("gl") !== "full" && softwareGL()) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: ctx.canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  return buildWorld({ ...ctx, renderer });
}

// The build runs in short steps with pauses between them, so scrolling and
// reading stay smooth while the city assembles.
async function buildWorld(ctx) {
  const { renderer, canvas, $, esc, days, dayName, signal, focusDay, goTo, playBeats, stops, isPhone, isReduced } = ctx;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e9c39e");
  scene.fog = new THREE.Fog(scene.background.clone(), 150, 300);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // ---- landmarks registry: hoverable, liftable, clickable groups --------------
  const picks = [];
  const LM = {};
  function landmark(name, opts, ...objs) {
    const g = new THREE.Group();
    objs.forEach((o) => g.add(o));
    g.traverse((o) => { o.userData.lm = name; });
    scene.add(g); picks.push(g);
    LM[name] = { group: g, lift: true, ...opts };
    return g;
  }

  await prepareTextures(pause);
  const cityGroup = new THREE.Group(); scene.add(cityGroup);
  const land = buildLand(); cityGroup.add(land.group);
  await pause();
  const sky = buildSkyline(); cityGroup.add(sky.group);
  await pause();
  const lm = await buildLandmarks({ scene, landmark, days, signal, onBeat: ctx.onBeat, isReduced, pause });
  picks.push(...lm.towers);
  LM.towers = { lift: false };
  landmark("me", { tip: "Jason", sub: "Tap to say hi", section: "#about", c: "#1a9e84", lift: false, click: wave }, lm.me, lm.station);
  await pause();
  const sea = buildSea({ scene, renderer, isPhone });
  const beaconMat = std("#ff3b30", { emissive: "#ff2a1f", emissiveIntensity: 0.4 });
  scene.add(instance(new THREE.SphereGeometry(0.09, 10, 8), beaconMat, [...sky.beacons, ...lm.beacons], false));

  // The avatar waves and says hello.
  const bubbleEl = $("#bubble");
  let bubbleUntil = 0;
  function say(text, ms = 3800) { bubbleEl.textContent = text; bubbleEl.classList.add("on"); bubbleUntil = performance.now() + ms; }
  function wave() {
    const { armR, me } = lm, y0 = me.position.y;
    say("Hi, I'm Jason! Scroll on to tour the city.");
    gsap.timeline().to(armR.rotation, { z: 2.7, duration: 0.35, ease: "power2.out" })
      .to(armR.rotation, { z: 2.25, duration: 0.18, repeat: 5, yoyo: true, ease: "sine.inOut" })
      .to(armR.rotation, { z: 0, duration: 0.5, ease: "back.out(1.6)" });
    gsap.timeline().to(me.position, { y: y0 + 0.5, duration: 0.22, ease: "power2.out" }).to(me.position, { y: y0, duration: 0.5, ease: "bounce.out" });
  }

  // ---- the plane and a few soft clouds -------------------------------------------
  const plane = new THREE.Group();
  const hullMat = std("#f1eee8", { roughness: 0.35, metalness: 0.2 });
  const fus = mesh(new THREE.CapsuleGeometry(0.24, 1.8, 8, 16), hullMat); fus.rotation.z = Math.PI / 2; plane.add(fus);
  plane.add(mesh(rbox(0.55, 0.06, 2.8, 0.03), hullMat, 0.1, -0.05, 0), mesh(rbox(0.3, 0.05, 1, 0.02), hullMat, -0.95, 0.05, 0));
  plane.add(mesh(rbox(0.36, 0.55, 0.06, 0.03), std("#b5644d", { roughness: 0.4 }), -1, 0.3, 0));
  scene.add(plane);
  const cloudGeo = new THREE.IcosahedronGeometry(1, 3);
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group(), s = 1.2 + (i % 3) * 0.35, mat = std("#ffffff", { roughness: 1, transparent: true, opacity: 0.6, depthWrite: false });
    [[0, 0, 0, 1.6, 0.8, 1.2], [1.4, 0.3, 0.2, 1.2, 0.9, 1], [-1.3, 0.1, -0.2, 1.1, 0.7, 0.9], [0.3, 0.6, -0.2, 1, 0.8, 0.9]]
      .forEach(([x, y, z, sx, sy, sz]) => { const m = mesh(cloudGeo, mat, x * s, y * s, z * s); m.scale.set(sx * s, sy * s, sz * s); g.add(m); });
    g.userData.mat = mat;
    g.position.set(-46 + i * 21, 22 + (i % 3) * 2, -26 + ((i * 13) % 46));
    scene.add(g); clouds.push(g);
  }

  // ---- draw-call budget: merge statics, keep small details out of the mirror -------
  for (const g of [...scene.children]) {
    if (g.isMesh || !g.children.length || g.userData.live) continue;
    mergeStatic(g); // one district or landmark per task
    await pause();
  }
  mergeStatic(scene); // the loose meshes on the scene itself
  const detail = (o) => o.traverse((c) => c.layers.set(DETAIL));
  sky.group.children.filter((o) => !sky.occluders.includes(o)).forEach(detail);
  land.group.children.filter((o) => !land.occluders.includes(o)).forEach(detail);
  [...clouds, plane].forEach(detail);

  // ---- light ------------------------------------------------------------------------
  const hemi = new THREE.HemisphereLight("#b7cbe0", "#6b5848", 0.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffad62", 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isPhone() ? 1024 : 2048, isPhone() ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -44, right: 44, top: 44, bottom: -44, near: 1, far: 180 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun);
  const rim = new THREE.DirectionalLight("#9ab8ff", 0.3); rim.position.set(-40, 18, 30); scene.add(rim);
  const plazaLights = isPhone() ? [] : [[-1.5, 7.5, 3], [8, 5.5, 19.5], [25, 6, 30.5], [-27.5, 6, 23]].map(([x, y, z]) => {
    const p = new THREE.PointLight("#ffb46a", 0, 15, 2); p.position.set(x, y, z); scene.add(p); return p;
  });

  // ---- camera + post: tilt-shift for the miniature, bloom for city lights --------
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -300, 600);
  cam.layers.enable(DETAIL);
  const state = { ...WP.hero };
  const drag = { az: 0 };
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0, 0.6, 0.75);
  composer.addPass(bloom);
  const hT = new ShaderPass(HorizontalTiltShiftShader), vT = new ShaderPass(VerticalTiltShiftShader);
  composer.addPass(hT); composer.addPass(vT);
  composer.addPass(new OutputPass());
  // Adaptive quality: if frames run slow, step down resolution, mirror rate,
  // and shadow updates. Nothing is removed; every landmark and interaction stays.
  const quality = { level: 2, scale: 1, reflectEvery: isPhone() ? 2 : 1, shadowEvery: isPhone() ? 2 : 1 };
  renderer.shadowMap.autoUpdate = quality.shadowEvery === 1;
  const perf = { frames: 0, sum: 0, n: 0 };
  function setQuality(level) {
    quality.level = level;
    if (level === 1) { quality.scale = 0.8; quality.reflectEvery = isPhone() ? 3 : 2; }
    if (level === 0) {
      quality.scale = 0.7; quality.reflectEvery = 0; quality.shadowEvery = 4;
      sea.u.uReflect.value = 0;
      hT.enabled = vT.enabled = false;
      renderer.shadowMap.autoUpdate = false;
    }
    resize();
  }
  function measure(raw) {
    perf.frames++;
    if (perf.frames < 150 || document.hidden || quality.level === 0) return; // skip the intro and the first compile
    perf.sum += raw; perf.n++;
    if (perf.n < 90) return;
    if (perf.sum / perf.n > 1 / 40) setQuality(quality.level - 1);
    perf.sum = 0; perf.n = 0;
  }
  function resize() {
    const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight), a = w / h, pr = Math.min(devicePixelRatio || 1, isPhone() ? 1.25 : 1.5) * quality.scale;
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
    composer.setPixelRatio(pr); composer.setSize(w, h);
    sea.resize(w * pr * (isPhone() ? 0.4 : 0.5), h * pr * (isPhone() ? 0.4 : 0.5));
    const view = a < 1 ? (34 / Math.max(a, 0.55)) * 0.72 : 34;
    cam.left = (-view * a) / 2; cam.right = (view * a) / 2; cam.top = view / 2; cam.bottom = -view / 2;
    if (w > 900) cam.setViewOffset(w, h, -w * 0.2, 0, w, h);
    else cam.setViewOffset(w, h, 0, h * 0.24, w, h);
    cam.updateProjectionMatrix();
    const blur = isPhone() ? 1.6 : 2.2;
    hT.uniforms.h.value = blur / w; vT.uniforms.v.value = blur / h;
    hT.uniforms.r.value = vT.uniforms.r.value = isPhone() ? 0.7 : 0.5;
  }
  resize();
  addEventListener("resize", resize);

  function applyTime(n) {
    tri(SKY.bg, n, scene.background); scene.fog.color.copy(scene.background); sea.u.fogColor.value.copy(scene.background);
    tri(SKY.sun, n, sun.color); sun.intensity = triN(3.2, 1.8, 0.28, n);
    if (n < 0.5) sun.position.lerpVectors(SUNPOS[0], SUNPOS[1], n * 2); else sun.position.lerpVectors(SUNPOS[1], SUNPOS[2], (n - 0.5) * 2);
    tri(SKY.hemiSky, n, hemi.color); tri(SKY.hemiGround, n, hemi.groundColor); hemi.intensity = triN(0.55, 0.45, 0.22, n);
    rim.intensity = triN(0.3, 0.42, 0.22, n);
    scene.environmentIntensity = triN(0.3, 0.22, 0.08, n);
    tri(SKY.deep, n, sea.u.uDeep.value); tri(SKY.shallow, n, sea.u.uShallow.value);
    sea.u.uSun.value.copy(sun.position).normalize();
    sea.u.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity * 0.45);
    const Lt = THREE.MathUtils.smoothstep(n, 0.3, 0.75); // city lights come on through dusk
    cityLights.value = Lt;
    land.wetMats.forEach((m, i) => { m.roughness = (i ? 0.82 : 0.85) - Lt * 0.32; }); // wet-looking streets after dark
    sky.night(Lt); lm.night(Lt);
    plazaLights.forEach((p) => { p.intensity = Lt * 14; });
    bloom.enabled = n > 0.25; bloom.strength = Lt * 0.55;
    sea.foamMat.opacity = 0.28 - Lt * 0.14;
  }

  // ---- interaction: hover, click, drag -------------------------------------------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const tipEl = $("#tip");
  let hovered = null, hoverTower = -1, pointer = { x: 0, y: 0, inside: false }, needPick = false;
  const lmOf = (obj) => { for (let o = obj; o; o = o.parent) if (o.userData.lm) return o.userData.lm; return null; };
  // Ground and skyline join the test as occluders, so a landmark behind a tower can't be hovered through it.
  const occluders = [...land.occluders, ...sky.occluders];
  function pick(x, y) {
    ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects([...picks, ...occluders], true)[0];
    if (!hit || occluders.includes(hit.object)) return { lm: null, tower: -1 };
    return { lm: lmOf(hit.object), tower: hit.object.userData.tower ?? -1 };
  }
  function setHover(name, tower) {
    if (name === hovered && tower === hoverTower) return;
    if (hovered && LM[hovered]) {
      const o = LM[hovered];
      if (o.lift !== false && o.group) gsap.to(o.group.position, { y: 0, duration: 0.5, ease: "power3.out" });
      o.hover?.(false);
    }
    hovered = name; hoverTower = tower;
    canvas.classList.toggle("pointing", !!name);
    if (!name) { tipEl.classList.remove("on"); return; }
    const o = LM[name];
    if (o.lift !== false && o.group && !isReduced()) gsap.to(o.group.position, { y: 0.35, duration: 0.55, ease: "back.out(2)" });
    o.hover?.(true);
    if (tower >= 0) {
      const d = days[tower];
      tipEl.style.setProperty("--c", tower === signal.bestIndex ? "#1a9e84" : tower === signal.worstIndex ? "#e8735a" : "#3e6fd8");
      tipEl.innerHTML = `<i></i>${dayName[d.day]} · ${d.minutes.toFixed(1)} min<small>Tap to light it in the chart</small>`;
    } else {
      tipEl.style.setProperty("--c", o.c);
      tipEl.innerHTML = `<i></i>${esc(o.tip)}<small>${esc(o.sub)}</small>`;
    }
    tipEl.classList.add("on");
  }
  let dragging = false, downX = 0, downY = 0, startAz = 0, moved = 0;
  canvas.addEventListener("pointerdown", (e) => {
    downX = e.clientX; downY = e.clientY; moved = 0;
    if (e.pointerType === "touch") return;
    dragging = true; startAz = drag.az; gsap.killTweensOf(drag);
    canvas.setPointerCapture(e.pointerId); canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    pointer = { x: e.clientX, y: e.clientY, inside: true };
    moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    if (dragging) {
      drag.az = THREE.MathUtils.clamp(startAz + ((e.clientX - downX) / innerWidth) * 1.6, -0.7, 0.7);
      tipEl.classList.remove("on");
    } else needPick = true;
    tipEl.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
  });
  canvas.addEventListener("pointerleave", () => { pointer.inside = false; if (!dragging) setHover(null, -1); });
  canvas.addEventListener("pointerup", (e) => {
    if (dragging) {
      dragging = false; canvas.classList.remove("dragging");
      gsap.to(drag, { az: 0, duration: isReduced() ? 0 : 1.6, ease: "elastic.out(1, 0.45)" });
    }
    if (moved < 6) activate(pick(e.clientX, e.clientY));
  });
  canvas.addEventListener("pointercancel", () => { dragging = false; canvas.classList.remove("dragging"); });
  let current = "hero";
  function activate({ lm: name, tower }) {
    if (tower >= 0) { if (current !== "signal") goTo("#signal"); focusDay(tower); return; }
    if (!name) return;
    const o = LM[name];
    o.click?.();
    if (o.section && current !== o.section.slice(1)) goTo(o.section);
    else if (!o.click && o.group && !isReduced()) gsap.fromTo(o.group.position, { y: 0.8 }, { y: hovered === name ? 0.35 : 0, duration: 0.8, ease: "bounce.out" });
  }

  // ---- golden hour into night: scroll-driven, with a manual override ---------------
  const env = { night: 0 };
  let nightOverride = null;
  const nightTween = { v: 0 };
  const toggle = $("#daynight");
  toggle.addEventListener("click", () => {
    nightOverride = env.night > 0.5 ? 0 : 1;
    nightTween.v = env.night;
    gsap.to(nightTween, { v: nightOverride, duration: isReduced() ? 0 : 1.8, ease: "power2.inOut", overwrite: true });
    toggle.setAttribute("aria-pressed", String(nightOverride === 1));
    toggle.setAttribute("aria-label", nightOverride === 1 ? "Switch to golden hour" : "Switch to night");
  });

  // ---- render loop -----------------------------------------------------------------
  const v3 = new THREE.Vector3(), target = new THREE.Vector3();
  const clock = new THREE.Clock();
  let raf = 0, frameNo = 0;
  const project = (x, y, z) => { v3.set(x, y, z).project(cam); return [(v3.x * 0.5 + 0.5) * innerWidth, (-v3.y * 0.5 + 0.5) * innerHeight]; };
  function frame() {
    const raw = clock.getDelta(), dt = Math.min(raw, 0.05), t = clock.elapsedTime, motion = !isReduced();
    measure(raw);
    frameNo++;
    const az = state.az + drag.az + (motion ? Math.sin(t * 0.1) * 0.02 : 0);
    const R = 140;
    cam.position.set(state.tx + R * Math.cos(state.el) * Math.cos(az), state.ty + R * Math.sin(state.el), state.tz + R * Math.cos(state.el) * Math.sin(az));
    cam.zoom = state.zoom * (isPhone() ? 0.85 : 1); cam.updateProjectionMatrix();
    cam.lookAt(state.tx, state.ty, state.tz);
    target.set(state.tx, state.ty, state.tz);
    sea.u.uView.value.copy(target).sub(cam.position).normalize();

    env.night = nightOverride === null ? state.night : nightTween.v;
    applyTime(env.night);

    if (motion) {
      lm.animate(t, dt);
      sky.moveCars(dt);
      const a = t * 0.2;
      plane.position.set(18 + Math.cos(a) * 10, 10.5 + Math.sin(a * 2) * 0.35, -7 + Math.sin(a) * 6.5);
      plane.rotation.y = -a - Math.PI / 2; plane.rotation.z = Math.sin(a * 2) * 0.1;
      lm.head.rotation.y = Math.sin(t * 0.5) * 0.35;
      lm.armL.rotation.z = Math.sin(t * 1.2) * 0.04;
      lm.globe.rotation.y += dt * lm.spin.speed; lm.ring.rotation.y += dt * lm.spin.speed * 0.4;
      clouds.forEach((c, i) => { c.position.x += dt * (0.45 + (i % 3) * 0.18); if (c.position.x > 56) c.position.x = -56; });
      sea.u.uTime.value = t;
    }
    // Clouds thin out as they drift across the subject.
    const fx = isPhone() ? innerWidth * 0.5 : innerWidth * 0.62, fy = isPhone() ? innerHeight * 0.3 : innerHeight * 0.5;
    clouds.forEach((c) => {
      const [cx, cy] = project(c.position.x, c.position.y, c.position.z);
      c.userData.mat.opacity = THREE.MathUtils.clamp(Math.hypot(cx - fx, cy - fy) / 420, 0.04, 0.38) * (1 - env.night * 0.6);
    });
    beaconMat.emissiveIntensity = (0.3 + env.night * 2.4) * (Math.sin(t * 3.2) > 0.55 ? 1 : 0.12);
    lm.beam.rotation.y = t * 0.9;
    lm.beam.material.opacity = Math.max(env.night * 0.045, lm.flash.v * 0.25);
    lm.lamp.material.emissiveIntensity = 0.4 + env.night * 3.5 + lm.flash.v * 4;

    if (needPick && pointer.inside && !dragging) { const p = pick(pointer.x, pointer.y); setHover(p.lm, p.tower); needPick = false; }
    if (quality.shadowEvery > 1) renderer.shadowMap.needsUpdate = frameNo % quality.shadowEvery === 0;
    composer.render();
    // The mirror renders after the main pass (shadow maps exist by then) and the
    // water shows it next frame; the quality level sets how often it refreshes.
    if (quality.reflectEvery && frameNo % quality.reflectEvery === 0) sea.reflect(cam, target, [lm.beam]);

    if (bubbleEl.classList.contains("on")) {
      const [bx, by] = project(lm.me.position.x, lm.me.position.y + lm.meHeight + 0.3, lm.me.position.z);
      bubbleEl.style.transform = `translate(${bx}px, ${by}px) translate(-10%, -100%)`;
      if (performance.now() > bubbleUntil) bubbleEl.classList.remove("on");
    }
    raf = requestAnimationFrame(frame);
  }

  // ---- intro: the city rises from the sea, then the landmarks settle onto it -------
  const groups = Object.values(LM).filter((o) => o.group).map((o) => o.group);
  if (!isReduced()) {
    cityGroup.position.y = -7;
    gsap.to(cityGroup.position, { y: 0, duration: 1.8, ease: "power3.out" });
    groups.forEach((g, i) => gsap.fromTo(g.position, { y: 16 }, { y: 0, duration: 1.1, delay: 0.7 + i * 0.05, ease: "back.out(1.2)" }));
    lm.towers.forEach((tw, i) => {
      const y = tw.position.y; tw.scale.y = 0.001; tw.position.y = lm.towerBase;
      gsap.to(tw.scale, { y: 1, duration: 1.1, delay: 1.2 + i * 0.06, ease: "power3.out" });
      gsap.to(tw.position, { y, duration: 1.1, delay: 1.2 + i * 0.06, ease: "power3.out" });
    });
    gsap.from(state, { zoom: 0.62, duration: 2.4, ease: "power3.out" });
  }
  // Compile every shader before the first frame, off the main thread where the GPU driver allows.
  // The reflection environment is computed in a worker once the build is done; the
  // page stays idle while it runs, so its shader compile never contends with ours.
  scene.environment = await loadEnvironment();
  // Post-processing shaders compile alongside the scene's, in parallel where the
  // driver allows, instead of stalling the first frames.
  const warm = new THREE.Scene(), quad = new THREE.PlaneGeometry(1, 1);
  [hT.material, vT.material, ...bloom.separableBlurMaterials, bloom.compositeMaterial, bloom.materialHighPassFilter, bloom.blendMaterial]
    .filter(Boolean).forEach((m) => warm.add(new THREE.Mesh(quad, m)));
  // Compile against an off-screen target: the scene is drawn into the composer's
  // buffers (and the mirror's), which use different shader variants than the screen.
  renderer.setRenderTarget(composer.readBuffer);
  await Promise.all([renderer.compileAsync(scene, cam), renderer.compileAsync(warm, cam)]);
  renderer.setRenderTarget(null);
  if (new URLSearchParams(location.search).has("stats")) window.__city = { renderer, quality };
  frame();
  requestAnimationFrame(() => canvas.classList.add("on"));
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else { clock.getDelta(); frame(); } });

  // ---- scroll: one long camera glide, scrubbed ------------------------------------
  let tl, st;
  function rebuild() {
    tl?.kill(); st?.kill();
    tl = gsap.timeline({ paused: true });
    for (let i = 1; i < stops.length; i++) {
      const dist = Math.max(1, stops[i].offsetTop - stops[i - 1].offsetTop);
      tl.to(state, { ...WP[stops[i].dataset.wp], duration: dist, ease: "power1.inOut" });
    }
    st = ScrollTrigger.create({ start: () => stops[0].offsetTop, end: () => stops.at(-1).offsetTop, animation: tl, scrub: isReduced() ? true : 1.3 });
    ScrollTrigger.refresh();
  }
  // Build after the intro zoom so the scrubbed timeline starts from the hero view.
  setTimeout(rebuild, isReduced() ? 0 : 2500);

  stops.forEach((s) => ScrollTrigger.create({
    trigger: s, start: "top 55%", end: "bottom 55%",
    onToggle: (self) => {
      if (!self.isActive) return;
      current = s.dataset.wp;
      document.querySelectorAll("#stops a").forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${s.id}`)));
      if (s.id === "signal") playBeats();
    },
  }));
  return { rebuild };
}
