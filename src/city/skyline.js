// The skyline and the street: procedural towers in three facade types, roof
// plant, lamps with light pools, street trees, and traffic.
import * as THREE from "three";
import { PAL, hash, std, rbox, instance, facadeMat, canopyGeo } from "./kit.js";
import { TOP, isMain, isRoad, ROADS } from "./land.js";

// Landmark districts keep their ground; the skyline fills the rest.
export const ZONES = [
  { x: 0, z: 0, r: 4.5 }, { x: 18, z: -7, r: 9.5 }, { x: -6, z: -16, r: 8 }, { x: 3, z: -14.5, r: 4.5 }, { x: -17, z: 3, r: 7 },
  { x: 9, z: 16, r: 8 }, { x: -11, z: 15, r: 6.5 }, { x: 22, z: 12.5, r: 4 }, { x: 28, z: 13, r: 3 },
];
export const inZone = (x, z, pad = 0) => ZONES.some((f) => Math.hypot(x - f.x, z - f.z) < f.r + pad);

// Facade types: glass curtain wall, punched-window office, warm stone residential.
const TYPES = [
  { mat: facadeMat("#c2cad1", { cols: 2.6, rows: 1.9, winW: 0.9, winH: 0.74, rough: 0.4, metal: 0.25, lit: 0.5 }), tints: ["#b9c4cd", "#c7ccd0", "#a9b6c1"] },
  { mat: facadeMat("#cdc7bc", { cols: 2, rows: 1.6, winW: 0.56, winH: 0.54 }), tints: ["#cfc9be", "#bdb7ad", "#d8d1c4"] },
  { mat: facadeMat("#d6cbb7", { cols: 1.6, rows: 1.7, winW: 0.46, winH: 0.58, rough: 0.75, lit: 0.55 }), tints: ["#d9ccb6", "#cbbca5", "#e0d6c5"] },
];

export function buildSkyline() {
  const group = new THREE.Group();
  const taken = new Set();
  const plots = [];
  const free = (x, z) => isMain(x, z, 2.2) && !isRoad(x, z, 1.1) && !inZone(x, z, 1) && !taken.has(`${x},${z}`);
  for (let gx = -28; gx <= 26; gx += 3) for (let gz = -26; gz <= 26; gz += 3) {
    if (hash(gx * 3 + 1, gz * 5 + 2) < 0.12) continue;
    const w = hash(gx, gz * 3) > 0.55 ? 3 : 2, d = hash(gx * 7, gz) > 0.55 ? 3 : 2;
    const x0 = gx + Math.floor(hash(gx + 5, gz) * 2) - 1, z0 = gz + Math.floor(hash(gx, gz + 9) * 2) - 1;
    let ok = true;
    for (let x = x0; x < x0 + w && ok; x++) for (let z = z0; z < z0 + d && ok; z++) if (!free(x, z)) ok = false;
    if (!ok) continue;
    let h = 3 + Math.floor(hash(gx * 11, gz * 13) * 7);
    if (x0 + z0 > 12) h = Math.min(h, 5); // the front of the view stays low so landmarks read
    if (Math.hypot(x0 - 18, z0 + 7) < 15) h = Math.min(h, 5); // and clear of the plane's circuit
    for (let x = x0 - 1; x <= x0 + w; x++) for (let z = z0 - 1; z <= z0 + d; z++) taken.add(`${x},${z}`);
    plots.push({ x: x0 + (w - 1) / 2, z: z0 + (d - 1) / 2, w: w - 0.2, d: d - 0.2, h, type: Math.floor(hash(gx * 17, gz * 19) * 3), i: plots.length });
  }

  // Towers: tall ones step back above a podium.
  const parts = TYPES.map(() => []);
  const col = new THREE.Color();
  plots.forEach((p) => {
    const list = parts[p.type];
    if (p.h >= 7) {
      const ph = Math.round(p.h * 0.45);
      list.push({ x: p.x, y: TOP + ph / 2, z: p.z, w: p.w, h: ph, d: p.d, p });
      list.push({ x: p.x, y: TOP + ph + (p.h - ph) / 2, z: p.z, w: p.w - 0.6, h: p.h - ph, d: p.d - 0.6, p });
    } else list.push({ x: p.x, y: TOP + p.h / 2, z: p.z, w: p.w, h: p.h, d: p.d, p });
  });
  const occluders = [];
  parts.forEach((list, t) => {
    const im = instance(new THREE.BoxGeometry(1, 1, 1), TYPES[t].mat, list.map((b) => [b.x, b.y, b.z, b.w, b.h, b.d]));
    list.forEach((b, i) => im.setColorAt(i, col.set(TYPES[t].tints[b.p.i % 3])));
    group.add(im); occluders.push(im);
  });

  // Roofs: parapet caps, plant, water tanks, masts with warning beacons.
  const caps = [], acs = [], tanks = [], masts = [], beacons = [];
  plots.forEach((p) => {
    const top = TOP + p.h, inset = p.h >= 7 ? 0.6 : 0;
    const w = p.w - inset, d = p.d - inset;
    caps.push([p.x, top + 0.07, p.z, w + 0.06, 0.14, d + 0.06]);
    const n = 1 + Math.floor(hash(p.i * 3, 7) * 2.99);
    for (let k = 0; k < n; k++) acs.push([p.x + (hash(p.i, k + 1) - 0.5) * (w - 0.8), top + 0.3, p.z + (hash(k + 3, p.i) - 0.5) * (d - 0.8)]);
    if (hash(p.i, 99) > 0.55) tanks.push([p.x - (w - 0.8) * 0.3, top + 0.42, p.z + (d - 0.8) * 0.3]);
    if (p.h >= 7) { masts.push([p.x + 0.3, top + 0.95, p.z - 0.3]); beacons.push([p.x + 0.3, top + 1.75, p.z - 0.3]); }
  });
  group.add(instance(new THREE.BoxGeometry(1, 1, 1), std("#8f949a", { roughness: 0.7 }), caps));
  group.add(instance(rbox(0.5, 0.32, 0.5, 0.04), std("#b2b6bb", { roughness: 0.45, metalness: 0.4 }), acs));
  group.add(instance(new THREE.CylinderGeometry(0.28, 0.28, 0.55, 18), std("#a8a196", { roughness: 0.6 }), tanks));
  group.add(instance(new THREE.CylinderGeometry(0.025, 0.045, 1.6, 6), std("#3a3f48", { metalness: 0.5 }), masts));

  // Street lamps and trees along the avenues, with light pools after dusk.
  const lamps = [], trees = [];
  const spot = (x, z) => isMain(x, z, 0.6) && !isRoad(x, z, 0.15) && !taken.has(`${Math.round(x)},${Math.round(z)}`) && !inZone(x, z, -1.5);
  for (const r of ROADS) {
    if (r.w < 2) continue;
    for (let s = Math.ceil(r.lo) + 0.5; s < r.hi; s += 3) for (const side of [-1, 1]) {
      const q = r.c + side * (r.w / 2 + 0.45);
      const [x, z] = r.a === "x" ? [s, q] : [q, s];
      if (!spot(x, z)) continue;
      (Math.round(s / 3) % 2 ? lamps : trees).push([x, z, side, r.a]);
    }
  }
  const poleMat = std("#30353d", { metalness: 0.6, roughness: 0.35 });
  group.add(instance(new THREE.CylinderGeometry(0.035, 0.05, 1.7, 8), poleMat, lamps.map(([x, z]) => [x, TOP + 0.85, z])));
  // Arms reach over the road; heads hang at their tips.
  const reach = ([x, z, side, a], d) => (a === "x" ? [x, z - side * d] : [x - side * d, z]);
  group.add(instance(new THREE.BoxGeometry(1, 1, 1), poleMat, lamps.map((l) => {
    const [x, z] = reach(l, 0.2);
    return [x, TOP + 1.68, z, l[3] === "x" ? 0.05 : 0.42, 0.04, l[3] === "x" ? 0.42 : 0.05];
  })));
  const lampHeadMat = std("#f4ead6", { emissive: "#ffc98a", emissiveIntensity: 0.15 });
  const heads = lamps.map((l) => { const [x, z] = reach(l, 0.38); return [x, TOP + 1.62, z]; });
  group.add(instance(rbox(0.22, 0.07, 0.22, 0.03), lampHeadMat, heads, false));
  const poolTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,0.33)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, color: "#ffb15c", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  group.add(instance(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2), poolMat, heads.map(([x, , z]) => [x, TOP + 0.02, z]), false));
  group.add(instance(rbox(0.7, 0.24, 0.7, 0.04), std("#b3ab9e", { roughness: 0.8 }), trees.map(([x, z]) => [x, TOP + 0.12, z])));
  group.add(instance(new THREE.CylinderGeometry(0.06, 0.08, 1, 7), std(PAL.bark, { roughness: 0.9 }), trees.map(([x, z]) => [x, TOP + 0.62, z])));
  const canopies = instance(canopyGeo(), std(PAL.leaf, { roughness: 0.85 }), trees.map(([x, z]) => [x, TOP + 1.45, z, 1, 0.9, 1, hash(Math.round(x * 5), Math.round(z)) * 6]));
  trees.forEach(([x, z], i) => canopies.setColorAt(i, col.set(hash(Math.round(x * 3), Math.round(z)) > 0.5 ? PAL.leaf : PAL.leaf2)));
  group.add(canopies);

  // Traffic: two lanes per avenue, driving on the left.
  const lanes = [];
  for (const r of ROADS) {
    if (r.w < 2 || r.hi - r.lo < 5) continue;
    for (const side of [-1, 1]) {
      const dir = r.a === "x" ? -side : side;
      lanes.push({ a: r.a, c: r.c + side * 0.5, f: dir > 0 ? r.lo : r.hi, t: dir > 0 ? r.hi : r.lo, len: r.hi - r.lo });
    }
  }
  const cars = [];
  lanes.forEach((lane, li) => {
    const count = Math.max(1, Math.round(lane.len / 10));
    for (let k = 0; k < count; k++) cars.push({ lane, u: (k / count + hash(li, k) * 0.2) % 1, speed: 2 + hash(k, li) * 1.3 });
  });
  const CAR_COLS = ["#e9e6df", "#2b313c", "#7d8590", "#b5644d", "#56708f", "#c8c3b8", "#3f5d52"];
  const carBody = new THREE.InstancedMesh(rbox(0.92, 0.3, 0.48, 0.1), std("#ffffff", { roughness: 0.28, metalness: 0.5 }), cars.length);
  const carCabin = new THREE.InstancedMesh(rbox(0.5, 0.22, 0.42, 0.07), std("#1c2230", { roughness: 0.08, metalness: 0.85 }), cars.length);
  const headMat = std("#fff6dc", { emissive: "#fff1c4", emissiveIntensity: 0.4 });
  const tailMat = std("#ff4a3d", { emissive: "#ff2a1f", emissiveIntensity: 0.3 });
  const carHead = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.06, 0.36), headMat, cars.length);
  const carTail = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.06, 0.36), tailMat, cars.length);
  cars.forEach((c, i) => carBody.setColorAt(i, col.set(CAR_COLS[i % CAR_COLS.length])));
  carBody.castShadow = carCabin.castShadow = true;
  group.add(carBody, carCabin, carHead, carTail);
  const dummy = new THREE.Object3D(), child = new THREE.Object3D(), m4 = new THREE.Matrix4();
  const sub = (im, i, ox, oy) => { child.position.set(ox, oy, 0); child.updateMatrix(); m4.multiplyMatrices(dummy.matrix, child.matrix); im.setMatrixAt(i, m4); };
  function moveCars(dt) {
    cars.forEach((car, i) => {
      car.u = (car.u + (dt * car.speed) / car.lane.len) % 1;
      const ln = car.lane, p = ln.f + (ln.t - ln.f) * car.u, dir = Math.sign(ln.t - ln.f);
      // Cars shrink away at the ends of each avenue instead of popping.
      const fade = Math.max(0.001, Math.min(1, car.u / 0.05, (1 - car.u) / 0.05));
      dummy.position.set(ln.a === "x" ? p : ln.c, TOP + 0.23, ln.a === "x" ? ln.c : p);
      dummy.rotation.set(0, ln.a === "x" ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? -Math.PI / 2 : Math.PI / 2), 0);
      dummy.scale.setScalar(fade);
      dummy.updateMatrix();
      carBody.setMatrixAt(i, dummy.matrix);
      sub(carCabin, i, -0.07, 0.24); sub(carHead, i, 0.46, 0.02); sub(carTail, i, -0.46, 0.02);
    });
    for (const im of [carBody, carCabin, carHead, carTail]) im.instanceMatrix.needsUpdate = true;
  }
  moveCars(0);

  function night(Lt) {
    lampHeadMat.emissiveIntensity = 0.15 + Lt * 3;
    poolMat.opacity = Lt * 0.5;
    headMat.emissiveIntensity = 0.4 + Lt * 2.4;
    tailMat.emissiveIntensity = 0.3 + Lt * 1.6;
  }
  return { group, occluders, beacons, moveCars, night };
}
