// The landmarks: each project, job and degree as an architectural model, with
// its own small interaction. Tooltips carry only facts from content.ts.
import * as THREE from "three";
import { gsap } from "gsap";
import { PAL, TEX, texFor, std, rbox, mesh, instance, facadeMat, canopyGeo, frondGeo, gableGeo, carGroup } from "./kit.js";
import { TOP, isLand } from "./land.js";
import { buildJason } from "./jason.js";

const V = (x, y) => new THREE.Vector2(x, y);

// Async so the build can pause between districts and keep the page responsive.
export async function buildLandmarks({ scene, landmark, days, signal, onBeat, isReduced, pause }) {
  const nightFx = [];
  const concrete = std(PAL.concrete, { roughness: 0.72 });
  const white = std(PAL.white, { roughness: 0.55 });
  const dark = std(PAL.navy, { roughness: 0.45, metalness: 0.35 });
  const bronze = std(PAL.bronze, { roughness: 0.35, metalness: 0.8 });
  const leaf = std(PAL.leaf, { roughness: 0.85 });
  const shrub = canopyGeo();
  const glow = (color, k, base = 0) => { const m = std(color, { emissive: color, emissiveIntensity: base }); nightFx.push((Lt) => { m.emissiveIntensity = base + Lt * k; }); return m; };
  const scaled = (m, s) => { m.scale.setScalar(s); return m; };

  // ---- the plaza: Jason's podium ------------------------------------------------
  scene.add(mesh(rbox(6, 0.3, 6, 0.04), std(PAL.curb, { roughness: 0.8 }), 0, TOP + 0.15, 0));
  scene.add(mesh(rbox(5, 0.7, 5, 0.04), std(PAL.plaza, { map: texFor(TEX.paving, 1.25), roughness: 0.75 }), 0, TOP + 0.65, 0));
  for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
    scene.add(mesh(rbox(0.8, 0.36, 0.8, 0.04), concrete, x, 3.68, z));
    scene.add(scaled(mesh(shrub, leaf, x, 4.15, z), 0.62));
  }

  // ---- airport: the seven delay towers at true scale -----------------------------
  const runway = mesh(new THREE.PlaneGeometry(17, 2).rotateX(-Math.PI / 2), std("#464b53", { roughness: 0.85, map: TEX.asphalt }), 17, TOP + 0.008, -2.5);
  runway.castShadow = false; scene.add(runway);
  const paint = new THREE.MeshStandardMaterial({ color: PAL.paint, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 });
  const flat = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  scene.add(instance(flat, paint, [...Array(8)].map((_, i) => [10 + i * 2, TOP + 0.014, -2.5, 0.9, 1, 0.08]), false));
  const baseline = mesh(flat, std("#2b3244", { roughness: 0.6 }), 17, TOP + 0.012, -10); // the zero baseline
  baseline.scale.set(15, 1, 1); baseline.castShadow = false; scene.add(baseline);

  const cabGlass = glow("#3e5668", 0.5); cabGlass.roughness = 0.06; cabGlass.metalness = 0.9; cabGlass.emissive.set("#ffc98a");
  const strip = mesh(new THREE.BoxGeometry(0.2, 5, 0.06), std("#3e5668", { roughness: 0.08, metalness: 0.9 }), 24.5 + 0.47, TOP + 3.1, -12.5 + 0.47, Math.PI / 4);
  landmark("tower", { tip: "Control tower", sub: "The airline delay study", section: "#signal", c: "#e8735a" },
    mesh(new THREE.CylinderGeometry(0.55, 0.75, 6, 32), concrete, 24.5, TOP + 3, -12.5), strip,
    mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.22, 8), white, 24.5, TOP + 5.95, -12.5),
    mesh(new THREE.CylinderGeometry(2.05, 1.6, 1.6, 8), cabGlass, 24.5, TOP + 6.86, -12.5),
    mesh(new THREE.CylinderGeometry(2.25, 2.1, 0.3, 8), dark, 24.5, TOP + 7.8, -12.5),
    mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.3, 8), dark, 24.5, TOP + 8.6, -12.5));
  const UNIT = 0.2, towerBase = TOP;
  const towers = days.map((d, i) => {
    const h = d.minutes * UNIT;
    const t = mesh(rbox(1.4, h, 1.4, 0.08), std("#ebe6dc", { emissive: "#000000", roughness: 0.42, metalness: 0.05 }), 12 + i * 2, towerBase + h / 2, -10);
    t.userData = { lm: "towers", tower: i };
    scene.add(t);
    return t;
  });
  const axisMat = std("#2b3244");
  scene.add(mesh(rbox(0.16, signal.axisMax * UNIT, 0.16, 0.05), axisMat, 10, towerBase + (signal.axisMax * UNIT) / 2, -10));
  for (const m of [signal.axisMax / 2, signal.axisMax]) scene.add(mesh(rbox(0.7, 0.08, 0.16, 0.03), axisMat, 10.3, towerBase + m * UNIT, -10));
  const baseCol = new THREE.Color("#ebe6dc"), coral = new THREE.Color("#e8735a"), teal = new THREE.Color("#1a9e84"), blue = new THREE.Color("#3e6fd8");
  onBeat.push(({ beat: b, focus }) => towers.forEach((t, i) => {
    let target = baseCol, glowK = 0, dim = 1;
    if (focus !== undefined) { if (i === focus) { target = blue; glowK = 0.25; } else dim = 0.86; }
    else if (b === 2) { if (i === signal.worstIndex) target = coral; else dim = 0.86; }
    else if (b === 3) { if (i === signal.bestIndex) { target = teal; glowK = 0.22; } else dim = 0.86; }
    const dur = isReduced() ? 0 : 0.8;
    gsap.to(t.material.color, { r: target.r * dim, g: target.g * dim, b: target.b * dim, duration: dur, ease: "power2.out" });
    gsap.to(t.material.emissive, { r: target.r * glowK, g: target.g * glowK, b: target.b * glowK, duration: dur });
  }));

  await pause();
  // ---- data district ----------------------------------------------------------------
  landmark("superstore", { tip: "Superstore", sub: "Sales and profit analysis", section: "#data", c: "#3e6fd8" },
    mesh(rbox(4, 3, 3, 0.04), facadeMat("#e2dbcf", { cols: 1, rows: 1, winW: 0.55, winH: 0.5, base: 3.4, lit: 0.6 }), -10.5, TOP + 1.5, -19),
    mesh(rbox(4.1, 0.42, 3.1, 0.03), std(PAL.terracotta, { roughness: 0.6 }), -10.5, TOP + 2.82, -19),
    mesh(rbox(3.4, 0.24, 2.4, 0.03), concrete, -10.5, TOP + 3.12, -19),
    mesh(rbox(1.8, 0.07, 0.8, 0.02), dark, -10.5, TOP + 1.1, -17.1));
  // The dashboard building's screen is a live chart that glows after dark.
  const screenTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#101828"; g.fillRect(0, 0, 128, 128);
    [0.45, 0.7, 0.55, 0.85, 0.62].forEach((v, i) => { g.fillStyle = i === 3 ? "#5fd0b5" : "#5b8def"; g.fillRect(14 + i * 21, 114 - v * 92, 14, v * 92); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const screenMat = new THREE.MeshStandardMaterial({ map: screenTex, emissiveMap: screenTex, emissive: "#ffffff", emissiveIntensity: 0.35, roughness: 0.3 });
  nightFx.push((Lt) => { screenMat.emissiveIntensity = 0.35 + Lt * 1.3; });
  landmark("dashboard", { tip: "Customer Retention Analytics", sub: "RFM and cohorts across 1.07M transactions", section: "#data", c: "#3e6fd8" },
    mesh(rbox(3, 5, 3, 0.04), facadeMat("#b9c3cb", { cols: 2.6, rows: 1.9, winW: 0.9, winH: 0.74, rough: 0.4, metal: 0.25, lit: 0.5 }), -5, TOP + 2.5, -20),
    mesh(rbox(3, 4, 0.9, 0.04), dark, -5, TOP + 2, -18.05),
    mesh(new THREE.PlaneGeometry(2.6, 2.6), screenMat, -5, TOP + 2.6, -17.58));
  const wallM = std("#ebe5d8", { roughness: 0.7 }), roofA = std("#56708f", { roughness: 0.55 }), roofB = std(PAL.terracotta, { roughness: 0.55 });
  const house = (x, z, roof) => [mesh(rbox(0.85, 0.7, 0.85, 0.03), wallM, x, TOP + 0.35, z), mesh(gableGeo(0.95, 0.42, 0.95), roof, x, TOP + 0.7, z)];
  landmark("churn", { tip: "Customer churn", sub: "Two segments, clustered", section: "#data", c: "#3e6fd8" },
    ...[[-11, -13, roofA], [-12, -11, roofA], [-10, -11, roofA], [-6, -12, roofB], [-5, -10, roofB], [-7, -10, roofB]].flatMap(([x, z, r]) => house(x, z, r)));
  const LEN = { 1: 0.95, 2: 1.45, 3: 2 };
  landmark("cars", { tip: "Vehicle prices", sub: "Cars along a regression line", section: "#data", c: "#3e6fd8" },
    ...[[-1, -12, 1], [1, -13, 1], [3, -14, 2], [5, -15, 2], [6, -17, 3]].map(([x, z, s], i) => {
      const g = carGroup(LEN[s], ["#b5644d", "#c9a24e", "#56708f", "#6f6a8a", "#3f7d6e"][i]);
      g.position.set(x + (s - 1) / 2, TOP, z);
      return g;
    }));

  await pause();
  // ---- the workshop: four builds, each with its own small trick ------------------
  const model = [mesh(rbox(2.6, 0.5, 2.6, 0.05), white, -20, TOP + 0.25, 0)];
  const modelGlass = std("#9fb1c2", { roughness: 0.2, metalness: 0.4 });
  for (let i = 0; i < 9; i++) {
    const h = 0.3 + ((i * 37) % 7) * 0.1;
    model.push(mesh(rbox(0.5, h, 0.5, 0.03), i % 3 ? concrete : modelGlass, -20.75 + (i % 3) * 0.75, TOP + 0.5 + h / 2, -0.75 + Math.floor(i / 3) * 0.75));
  }
  landmark("mini", { tip: "This portfolio", sub: "You're on it", section: "#ai", c: "#5c6f8a" }, ...model);
  const cards = ["#b5644d", "#c9a24e", "#3f7d6e", "#56708f"].map((c, i) => {
    const m = mesh(rbox(1.5, 2.2, 0.08, 0.05), std(c, { roughness: 0.4 }), -15 + i * 0.35, TOP + 1.2, 0.2);
    m.rotation.set(0, 0.3, -0.5 + i * 0.32); m.userData.base = m.rotation.z; m.userData.live = true;
    return m;
  });
  landmark("unfold", { tip: "Unfold", sub: "Conversation card game", section: "#ai", c: "#5c6f8a",
    hover: (on) => cards.forEach((m, i) => gsap.to(m.rotation, { z: m.userData.base + (on ? (i - 1.5) * 0.28 : 0), duration: 0.6, ease: "back.out(2)" })) }, ...cards);
  const coins = [];
  const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.18, 36);
  const coinMats = [std("#b98f3a", { metalness: 0.85, roughness: 0.26 }), std("#cfa74f", { metalness: 0.85, roughness: 0.26 })];
  [[-19, 6, 4], [-18, 7, 6], [-20, 7, 3]].forEach(([x, z, count]) => {
    for (let i = 0; i < count; i++) {
      const coin = mesh(coinGeo, coinMats[i % 2], x, TOP + 0.1 + i * 0.2, z);
      coin.userData.y = coin.position.y; coin.userData.live = true; coins.push(coin);
    }
  });
  landmark("kaching", { tip: "Kaching", sub: "Tap to make it rain", section: "#ai", c: "#5c6f8a", click: () => {
    coins.forEach((c, i) => gsap.timeline().to(c.position, { y: c.userData.y + 2.2 + (i % 3) * 0.4, duration: 0.45, delay: i * 0.025, ease: "power2.out" })
      .to(c.rotation, { y: `+=${Math.PI * 2}`, duration: 0.6 }, "<").to(c.position, { y: c.userData.y, duration: 0.7, ease: "bounce.out" }));
  } }, ...coins);
  // The observatory: a drum and dome under a bronze armillary sphere.
  const globe = mesh(new THREE.SphereGeometry(0.42, 32, 20), std("#2f4a66", { roughness: 0.25, metalness: 0.5 }), -13, TOP + 3.8, 7);
  globe.userData.live = true;
  const ring = new THREE.Group(); ring.position.set(-13, TOP + 3.8, 7); ring.rotation.set(0.4, 0, 0);
  for (const [rx, ry] of [[Math.PI / 2, 0], [0, 0], [0, Math.PI / 2], [Math.PI / 2, 0.8]]) {
    const t = mesh(new THREE.TorusGeometry(1, 0.03, 8, 72), bronze); t.rotation.set(rx, ry, 0); ring.add(t);
  }
  const spin = { speed: 0.3 };
  landmark("observatory", { tip: "Agentic OS", sub: "Usage observatory", section: "#ai", c: "#5c6f8a", hover: (on) => gsap.to(spin, { speed: on ? 2.4 : 0.3, duration: 0.8 }) },
    mesh(new THREE.CylinderGeometry(1.35, 1.45, 1.6, 48), white, -13, TOP + 0.8, 7),
    mesh(new THREE.CylinderGeometry(1.37, 1.37, 0.1, 48), bronze, -13, TOP + 1.5, 7),
    mesh(new THREE.SphereGeometry(1.2, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), std("#b8bcbf", { roughness: 0.3, metalness: 0.7 }), -13, TOP + 1.6, 7),
    mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.8, 12), bronze, -13, TOP + 2.95, 7), globe, ring);

  await pause();
  // ---- fintech quarter: Singapore and Jakarta -------------------------------------
  const mbsMat = facadeMat("#d8d4cb", { cols: 3, rows: 2.2, winW: 0.94, winH: 0.66, rough: 0.35, metal: 0.3, lit: 0.5 });
  const mbs = [];
  for (const c of [4.5, 7.5, 10.5]) {
    mbs.push(mesh(rbox(1.25, 10, 3, 0.04), mbsMat, c - 0.42, TOP + 5, 16));
    const leg = mesh(rbox(0.95, 10.05, 3, 0.04), mbsMat, c + 0.55, TOP + 5, 16); leg.rotation.z = 0.045; mbs.push(leg);
  }
  const hull = new THREE.Shape();
  hull.moveTo(-6.3, -1.55); hull.lineTo(4.6, -1.55); hull.quadraticCurveTo(6.6, -1.3, 6.6, 0); hull.quadraticCurveTo(6.6, 1.3, 4.6, 1.55);
  hull.lineTo(-6.3, 1.55); hull.quadraticCurveTo(-6.7, 0, -6.3, -1.55);
  mbs.push(mesh(new THREE.ExtrudeGeometry(hull, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }).rotateX(-Math.PI / 2), white, 8.9, TOP + 10.05, 16));
  mbs.push(mesh(rbox(8.6, 0.05, 0.6, 0.02), std("#7fb3c4", { roughness: 0.06, metalness: 0.3 }), 8.2, TOP + 10.52, 17));
  for (const x of [5, 8, 11]) mbs.push(scaled(mesh(shrub, leaf, x, TOP + 10.75, 15.3), 0.45));
  const deckLed = mesh(new THREE.BoxGeometry(11, 0.07, 0.04), glow("#dff4ff", 2.2), 8.6, TOP + 10.12, 17.6);
  deckLed.material.emissive.set("#bfe8ff");
  landmark("kpay", { tip: "KPay · Singapore", sub: "Data Analyst Intern, 2025–2026", section: "#career", c: "#e8735a" }, ...mbs, deckLed);

  // The Merlion: lion's head, fish body, and a spout you can turn up.
  const statue = std("#ebe6dc", { roughness: 0.45 });
  const spout = { power: 1 };
  const SPOUT = new THREE.Vector3(13, TOP + 3.45, 20.15);
  const DROPS = 40;
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 10, 8), std("#e6f6ff", { roughness: 0.1, transparent: true, opacity: 0.8 }), DROPS);
  scene.add(drops);
  const tail = mesh(new THREE.TorusGeometry(0.42, 0.17, 12, 28, Math.PI * 1.2), statue, 13, TOP + 1.5, 18.1, Math.PI / 2);
  const body = mesh(new THREE.CapsuleGeometry(0.48, 1.3, 8, 20), statue, 13, TOP + 1.95, 18.75); body.rotation.x = -0.15;
  const mane = mesh(new THREE.TorusGeometry(0.58, 0.2, 12, 32), statue, 13, TOP + 3.45, 19.15); mane.rotation.x = 1.25;
  landmark("merlion", { tip: "Merlion · Singapore", sub: "Tap for a splash", section: "#career", c: "#e8735a",
    click: () => gsap.fromTo(spout, { power: 2 }, { power: 1, duration: 2.4, ease: "power2.out" }) },
    mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.8, 40), concrete, 13, TOP + 0.4, 19), body, tail, mane,
    mesh(new THREE.SphereGeometry(0.6, 32, 20), statue, 13, TOP + 3.55, 19.35),
    mesh(new THREE.SphereGeometry(0.3, 20, 14), statue, 13, TOP + 3.45, 19.85));

  // Menara BCA: a glass tower with a setback, a blue band and a crown.
  const bcaMat = facadeMat("#a1b2c2", { cols: 2.8, rows: 1.9, winW: 0.92, winH: 0.76, rough: 0.3, metal: 0.35, lit: 0.5 });
  landmark("bca", { tip: "BCA · Jakarta", sub: "Partnership & Benefits Analyst, 2023–2025", section: "#career", c: "#e8735a" },
    mesh(rbox(3, 8, 3, 0.04), bcaMat, 20, TOP + 4, 31),
    mesh(rbox(2.5, 4.2, 2.5, 0.04), bcaMat, 20, TOP + 10.1, 31),
    mesh(rbox(2.56, 0.3, 2.56, 0.03), std("#2f5596", { roughness: 0.4 }), 20, TOP + 11.6, 31),
    mesh(rbox(2, 0.8, 2, 0.04), dark, 20, TOP + 12.6, 31),
    mesh(new THREE.CylinderGeometry(0.035, 0.07, 1.4, 8), dark, 20, TOP + 13.7, 31));
  // Monas: stepped base, the cup, the obelisk, and the gold flame.
  const monasStone = std("#ece8df", { roughness: 0.5 });
  const flameMat = std(PAL.gold, { metalness: 0.9, roughness: 0.22, emissive: "#ffb42e", emissiveIntensity: 0.15 });
  const flame = mesh(new THREE.LatheGeometry([V(0, 0), V(0.32, 0.12), V(0.4, 0.45), V(0.28, 0.85), V(0.1, 1.15), V(0, 1.3)], 28), flameMat, 25, TOP + 11.8, 29);
  const flameFlare = { v: 0 };
  flame.userData.live = true;
  landmark("monas", { tip: "Monas · Jakarta", sub: "Tap to light the flame", section: "#career", c: "#e8735a",
    click: () => gsap.fromTo(flameFlare, { v: 1 }, { v: 0, duration: 2.2, ease: "power2.out" }) },
    mesh(rbox(3.2, 0.35, 3.2, 0.03), monasStone, 25, TOP + 0.175, 29),
    mesh(rbox(2.4, 0.35, 2.4, 0.03), monasStone, 25, TOP + 0.525, 29),
    mesh(new THREE.LatheGeometry([V(0.45, 0), V(0.6, 0.25), V(1.0, 0.55), V(1.35, 0.75), V(1.35, 0.86), V(0.4, 0.86)], 40), monasStone, 25, TOP + 0.7, 29),
    mesh(new THREE.CylinderGeometry(0.24, 0.42, 10, 4).rotateY(Math.PI / 4), monasStone, 25, TOP + 6.55, 29),
    mesh(rbox(0.75, 0.25, 0.75, 0.03), monasStone, 25, TOP + 11.65, 29), flame);
  // The ferry between Singapore and Jakarta, docking just off each seawall.
  const ferry = new THREE.Group();
  [[rbox(1.7, 0.42, 0.72, 0.16), "#f1eee8", [0, 0, 0]], [rbox(1.72, 0.1, 0.74, 0.04), "#25304a", [0, 0.06, 0]],
   [rbox(0.72, 0.4, 0.52, 0.08), "#f1eee8", [-0.2, 0.4, 0]], [rbox(0.74, 0.07, 0.54, 0.03), PAL.terracotta, [-0.2, 0.62, 0]]]
    .forEach(([g, c, p]) => ferry.add(mesh(g, std(c, { roughness: 0.4 }), ...p)));
  scene.add(ferry);
  let za = 18; while (isLand(15.5, za, -0.9) && za < 30) za += 0.1;
  let zb = 31; while (isLand(18.6, zb, -0.9) && zb > 18) zb -= 0.1;
  const ferryA = new THREE.Vector3(15.5, 0.95, za + 0.3), ferryB = new THREE.Vector3(18.6, 0.95, Math.max(za + 0.6, zb - 0.3));

  await pause();
  // ---- campus: Singapore and London ------------------------------------------------
  landmark("nus", { tip: "NUS · Singapore", sub: "Master of Communication, 2025–2026", section: "#education", c: "#a07f4a" },
    mesh(rbox(4, 3, 3, 0.04), facadeMat("#ebe6dc", { cols: 2, rows: 1.7, winW: 0.7, winH: 0.55, base: 3.1 }), -13.5, TOP + 1.5, 17),
    mesh(rbox(4.1, 0.36, 3.1, 0.03), std("#c97c3a", { roughness: 0.55 }), -13.5, TOP + 2.84, 17),
    mesh(rbox(2.2, 0.08, 0.9, 0.02), std("#2c4a86", { roughness: 0.5 }), -13.5, TOP + 1.1, 15.15),
    ...[-14.5, -12.5].map((x) => mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 8), dark, x, TOP + 0.53, 14.8)));
  // The Supertrees: planted trunks, steel canopies that glow after dark.
  const trunkMat = std("#55654f", { roughness: 0.92 });
  const canopyMat = std("#4d5550", { roughness: 0.45, metalness: 0.5, emissive: "#c75ad0", emissiveIntensity: 0, side: THREE.DoubleSide });
  const latticeMat = new THREE.MeshBasicMaterial({ color: "#262b29", wireframe: true });
  const treeFlash = { v: 0 };
  nightFx.push((Lt) => { canopyMat.emissiveIntensity = Lt * 0.5 + treeFlash.v * 1.3; });
  const supertrees = [[-9, 12, 5.6], [-7, 14, 4.4], [-9, 16.5, 6.2]].map(([x, z, h]) => {
    const g = new THREE.Group(); g.position.set(x, TOP, z);
    g.add(mesh(new THREE.LatheGeometry([V(0.44, 0), V(0.34, h * 0.25), V(0.26, h * 0.6), V(0.3, h * 0.9), V(0.44, h)], 20), trunkMat));
    const cup = [V(0.44, h), V(0.95, h + 0.3), V(1.5, h + 0.62), V(1.75, h + 0.8)];
    g.add(mesh(new THREE.LatheGeometry(cup, 32), canopyMat));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(cup.map((p) => V(p.x * 1.02, p.y + 0.01)), 16), latticeMat));
    const rim = mesh(new THREE.TorusGeometry(1.75, 0.045, 8, 64), canopyMat, 0, h + 0.8, 0); rim.rotation.x = Math.PI / 2; g.add(rim);
    return g;
  });
  const skyway = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-9, 6.8, 12), new THREE.Vector3(-8.3, 7.2, 14.2), new THREE.Vector3(-9, 6.8, 16.5)]), 24, 0.07, 8), dark);
  landmark("supertrees", { tip: "Supertree Grove · Singapore", sub: "Tap to light them up", section: "#education", c: "#a07f4a",
    click: () => gsap.fromTo(treeFlash, { v: 1 }, { v: 0, duration: 2.6, ease: "power2.out" }) }, ...supertrees, skyway);
  // LSE: brick with a stone cornice and a slate roof; a red phone box outside.
  const phoneBox = mesh(rbox(0.55, 1.3, 0.55, 0.05), std("#b8342d", { roughness: 0.4 }), -24, TOP + 0.65, 20);
  landmark("lse", { tip: "University of London · LSE", sub: "BSc, First Class Honours, 2020–2023", section: "#education", c: "#a07f4a" },
    mesh(rbox(3, 4, 3, 0.03), facadeMat("#a9583f", { map: texFor(TEX.brick, 1.5, 2), cols: 1.4, rows: 1.3, winW: 0.5, winH: 0.6, base: 3, rough: 0.8 }), -24, TOP + 2, 23),
    mesh(rbox(3.25, 0.22, 3.25, 0.03), std(PAL.stone, { roughness: 0.6 }), -24, TOP + 4.05, 23),
    mesh(rbox(2.8, 0.6, 2.8, 0.05), std("#4c535a", { roughness: 0.55 }), -24, TOP + 4.45, 23), phoneBox);
  // Elizabeth Tower: stone shaft, clock stage with live hands, belfry, spire.
  const clockMat = std("#f4efe2", { roughness: 0.4, emissive: "#ffe7a8", emissiveIntensity: 0 });
  nightFx.push((Lt) => { clockMat.emissiveIntensity = Lt * 0.55; });
  const handMat = std("#1f2533");
  const rimMat = std(PAL.gold, { metalness: 0.8, roughness: 0.3 });
  const hands = [];
  const clockFace = (x, y, z, ry) => {
    const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = ry;
    f.add(new THREE.Mesh(new THREE.CircleGeometry(0.72, 40), clockMat), new THREE.Mesh(new THREE.RingGeometry(0.72, 0.8, 40), rimMat));
    const hand = (len, w) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.03), handMat); m.position.y = len / 2; p.add(m); p.position.z = 0.03; f.add(p); return p; };
    hands.push({ h: hand(0.36, 0.06), m: hand(0.56, 0.04) });
    return f;
  };
  const bbStone = facadeMat("#cdb78d", { map: texFor(TEX.stone, 0.5, 2), cols: 1.5, rows: 0.8, winW: 0.28, winH: 0.62, base: 3.4, rough: 0.72, lit: 0.35 });
  const spire = mesh(new THREE.ConeGeometry(1.25, 1.8, 4), std("#4f5d58", { roughness: 0.45, metalness: 0.3 }), -29.5, 14.4, 20.5, Math.PI / 4);
  const chime = { spin: 0 };
  landmark("bigben", { tip: "Elizabeth Tower · London", sub: "Tap to ring the hour", section: "#education", c: "#a07f4a",
    click: () => gsap.fromTo(chime, { spin: 0 }, { spin: Math.PI * 4, duration: 1.8, ease: "power3.inOut" }) },
    mesh(rbox(2, 8, 2, 0.03), bbStone, -29.5, TOP + 4, 20.5),
    mesh(rbox(2.3, 2, 2.3, 0.03), bbStone, -29.5, TOP + 9, 20.5),
    mesh(rbox(1.9, 1, 1.9, 0.03), bbStone, -29.5, TOP + 10.5, 20.5), spire,
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz]) => mesh(new THREE.ConeGeometry(0.12, 0.6, 4), spire.material, -29.5 + dx * 1.05, 12.8, 20.5 + dz * 1.05)),
    clockFace(-28.33, 11.5, 20.5, Math.PI / 2), clockFace(-29.5, 11.5, 21.67, 0));
  const bus = new THREE.Group();
  [[rbox(2.6, 1.5, 0.95, 0.1), "#a8322c", [0, 0.95, 0]], [rbox(2.62, 0.2, 0.97, 0.04), "#1f2533", [0, 0.78, 0]],
   [rbox(2.62, 0.2, 0.97, 0.04), "#1f2533", [0, 1.36, 0]], [rbox(2.4, 0.05, 0.9, 0.02), "#efebe3", [0, 1.72, 0]]]
    .forEach(([g, c, p]) => bus.add(mesh(g, std(c, { roughness: 0.35 }), ...p)));
  const tyre = std("#1b1d22", { roughness: 0.85 }), wheel = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 18).rotateX(Math.PI / 2);
  for (const [wx, wz] of [[0.8, 0.45], [-0.8, 0.45], [0.8, -0.45], [-0.8, -0.45]]) bus.add(mesh(wheel, tyre, wx, 0.22, wz));
  bus.position.set(-27, TOP, 26);
  const busRide = { speed: 1 };
  let busPhase = 0, busHeading = 0;
  landmark("bus", { tip: "London bus", sub: "Tap to send it off", section: "#education", c: "#a07f4a", lift: false,
    click: () => gsap.fromTo(busRide, { speed: 3.2 }, { speed: 1, duration: 2.6, ease: "power2.out" }) }, bus);
  // Palms on the Jakarta islet; plane trees in London.
  const palmTrunk = std(PAL.bark, { roughness: 0.9 }), fronds = frondGeo(), frondMat = std("#5c7a4c", { roughness: 0.8, side: THREE.DoubleSide });
  const palmCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.15, 1.2, 0), new THREE.Vector3(0.1, 2.4, 0.1), new THREE.Vector3(-0.05, 3.1, 0)]);
  const palmGeo = new THREE.TubeGeometry(palmCurve, 12, 0.1, 8);
  for (const [x, z] of [[17.5, 33], [26, 33], [21, 27]]) {
    const p = new THREE.Group(); p.position.set(x, TOP, z); p.rotation.y = x;
    p.add(mesh(palmGeo, palmTrunk), mesh(fronds, frondMat, -0.05, 3.1, 0));
    scene.add(p);
  }
  for (const [x, z] of [[-31.5, 23], [-27, 18.5]]) {
    scene.add(mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.6, 8), palmTrunk, x, TOP + 0.8, z));
    scene.add(scaled(mesh(shrub, std(PAL.leaf2, { roughness: 0.85 }), x, TOP + 2.2, z), 1.6));
  }

  await pause();
  // ---- Jason on the plaza, at his desk -------------------------------------------
  const jason = buildJason();
  const { me, head, armL, armR, station } = jason;
  station.position.set(1.1, TOP + 1, -0.9); station.rotation.y = Math.PI / 4;
  nightFx.push((Lt) => { jason.screenMat.emissiveIntensity = 0.5 + Lt * 1.2; });
  me.position.set(0, TOP + 1, 0); me.rotation.y = Math.PI / 4;

  await pause();
  // ---- the lighthouse on the headland ---------------------------------------------
  const lighthouse = new THREE.Group();
  [PAL.white, "#b5564a", PAL.white, "#b5564a"].forEach((c, i) => lighthouse.add(mesh(new THREE.CylinderGeometry(0.74 - i * 0.06, 0.8 - i * 0.06, 1.2, 40), std(c, { roughness: 0.45 }), 28, TOP + 0.6 + i * 1.2, 13)));
  lighthouse.add(mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.1, 40), dark, 28, TOP + 5.25, 13));
  const rail = mesh(new THREE.TorusGeometry(0.74, 0.02, 6, 48), dark, 28, TOP + 5.55, 13); rail.rotation.x = Math.PI / 2; lighthouse.add(rail);
  const lamp = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 32), std("#fff3c4", { emissive: "#ffcf5a", emissiveIntensity: 0.4, roughness: 0.1 }), 28, TOP + 5.6, 13);
  lighthouse.add(lamp, mesh(new THREE.ConeGeometry(0.62, 0.7, 32), dark, 28, TOP + 6.3, 13));
  const beamGeo = new THREE.ConeGeometry(2.2, 16, 32, 1, true); beamGeo.translate(0, -8, 0); beamGeo.rotateZ(Math.PI / 2);
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: "#fff1b8", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.copy(lamp.position); scene.add(beam);
  const flash = { v: 0 };
  landmark("lighthouse", { tip: "The lighthouse", sub: "Get in touch", section: "#contact", c: "#e8735a", click: () => { flash.v = 1; gsap.to(flash, { v: 0, duration: 1.6, ease: "power2.out" }); } }, lighthouse);

  // ---- everything that moves, once per frame ----------------------------------------
  const m4 = new THREE.Matrix4(), dq = new THREE.Quaternion(), dv = new THREE.Vector3(), ds = new THREE.Vector3();
  function animate(t, dt) {
    const reach = 5 * spout.power, b = 1.4 * spout.power, c = SPOUT.y + b - 0.72;
    for (let i = 0; i < DROPS; i++) {
      const p = (t * 0.55 + i / DROPS) % 1;
      dv.set(SPOUT.x + Math.sin(i * 12.9) * 0.06, SPOUT.y + b * p - c * p * p, SPOUT.z + p * reach);
      const s = 1 - p * 0.35; ds.set(s, s, s);
      m4.compose(dv, dq, ds); drops.setMatrixAt(i, m4);
    }
    drops.instanceMatrix.needsUpdate = true;
    const u = (Math.sin(t * 0.22) + 1) / 2;
    ferry.position.lerpVectors(ferryA, ferryB, u); ferry.position.y += Math.sin(t * 2.1) * 0.05;
    const dir = Math.cos(t * 0.22) >= 0 ? 1 : -1;
    ferry.rotation.y += (Math.atan2(-(ferryB.z - ferryA.z) * dir, (ferryB.x - ferryA.x) * dir) - ferry.rotation.y) * Math.min(1, dt * 3);
    ferry.rotation.z = Math.sin(t * 1.7) * 0.03;
    busPhase += dt * 0.35 * busRide.speed;
    bus.position.x = -27 + Math.sin(busPhase) * 2.2;
    busHeading += ((Math.cos(busPhase) >= 0 ? 0 : Math.PI) - busHeading) * Math.min(1, dt * 4);
    bus.rotation.y = busHeading;
    flame.scale.set(1 + flameFlare.v * 0.3, 1 + Math.sin(t * 9) * 0.05 + flameFlare.v * 0.6, 1 + flameFlare.v * 0.3);
    const now = new Date(), mins = now.getMinutes() + now.getSeconds() / 60, hrs = (now.getHours() % 12) + mins / 60;
    hands.forEach(({ h, m }) => { m.rotation.z = -(mins / 60) * Math.PI * 2 - chime.spin; h.rotation.z = -(hrs / 12) * Math.PI * 2 - chime.spin / 12; });
  }
  animate(0, 0); // a static layout for reduced motion; the loop takes over otherwise
  function night(Lt) {
    nightFx.forEach((f) => f(Lt));
    flameMat.emissiveIntensity = 0.15 + Lt * 1.4 + flameFlare.v * 2.5;
  }
  return {
    towers, towerBase, me, head, armL, armR, station, meHeight: jason.height, globe, ring, spin, lamp, beam, flash, animate, night,
    beacons: [[24.5, TOP + 9.4, -12.5], [20, TOP + 14.5, 31], [4.1, TOP + 10.6, 14.8], [13.6, TOP + 10.6, 14.8]],
  };
}
