// The land: one coastline definition drives the ground slab, the seawalls,
// the surf line, the roads, and every placement test, so nothing pokes past
// the edge of the city.
import * as THREE from "three";
import { PAL, TEX, std, mesh, instance } from "./kit.js";

export const TOP = 2.5; // street level
const SX = 0.95, SZ = 1.05;
// Bumps in the main coastline: the airport apron and the lighthouse headland.
const BUMPS = [[-0.5, 2.6, 0.28], [0.47, 4.8, 0.1]];
const dAng = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const mainR = (t) => 27 * (1 + 0.02 * Math.sin(3 * t + 1) + 0.015 * Math.sin(5 * t + 2) + 0.008 * Math.sin(9 * t))
  + BUMPS.reduce((s, [c, a, w]) => s + a * Math.exp(-((dAng(t, c) / w) ** 2)), 0);
const isletR = (s) => (t) => s.r * (1 + 0.05 * Math.sin(3 * t + s.seed * 2) + 0.03 * Math.sin(5 * t + s.seed));
// Each outline: a centre, an axis scale, and a radius by angle.
export const OUTLINES = [
  { cx: 0, cz: 0, sx: SX, sz: SZ, R: mainR, main: true },
  ...[{ x: 22, z: 31, r: 6.5, seed: 1 }, { x: -27, z: 23, r: 6, seed: 2 }].map((s) => ({ cx: s.x, cz: s.z, sx: 1, sz: 1, R: isletR(s) })),
];
const inside = (o, x, z, pad = 0) => {
  const u = (x - o.cx) * o.sx, v = (z - o.cz) * o.sz;
  return Math.hypot(u, v) < o.R(Math.atan2(v, u)) - pad;
};
export const isMain = (x, z, pad = 0) => inside(OUTLINES[0], x, z, pad);
export const isLand = (x, z, pad = 0) => OUTLINES.some((o) => inside(o, x, z, pad));
// Outline points in shape space (x, -z), offset outward by `grow`.
export function outlinePts(o, grow = 0, n = 180) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, r = o.R(t) + grow;
    pts.push(new THREE.Vector2(o.cx + (r * Math.cos(t)) / o.sx, -(o.cz + (r * Math.sin(t)) / o.sz)));
  }
  return pts;
}

// Roads as [axis, centre, from, to, width]; clipped to the land below.
const ROAD_DEFS = [
  ["x", 9.5, -30.5, 20.5, 2], ["x", -5.5, -30.5, 7.5, 2], ["z", -8.5, -4.5, 8.5, 2], ["z", 6.5, -4.5, 8.5, 2],
  ["x", 26, -31, -23, 1.6], ["z", 22.5, 25.5, 34.5, 2],
];
const onRoad = (r, x, z, pad) => {
  const s = r.a === "x" ? x : z, q = r.a === "x" ? z : x;
  return s > r.lo - pad && s < r.hi + pad && Math.abs(q - r.c) < r.w / 2 + pad;
};
export const ROADS = ROAD_DEFS.map(([a, c, from, to, w]) => {
  const ok = (s) => [-w / 2, 0, w / 2].every((o) => (a === "x" ? isLand(s, c + o, 0.9) : isLand(c + o, s, 0.9)));
  let lo = Infinity, hi = -Infinity;
  for (let s = from; s <= to; s += 0.1) if (ok(s)) { lo = Math.min(lo, s); hi = Math.max(hi, s); }
  return { a, c, w, lo, hi };
}).filter((r) => r.hi - r.lo > 2);
export const isRoad = (x, z, pad = 0) => ROADS.some((r) => onRoad(r, x, z, pad));

export function buildLand() {
  const group = new THREE.Group();
  // Ground slabs: paved top, granite seawall sides, a bevelled coping edge.
  const topMat = std(PAL.paving, { map: TEX.paving, bumpMap: TEX.paving, bumpScale: 0.8, roughness: 0.82 });
  const wallMat = std(PAL.seawall, { map: TEX.stone, bumpMap: TEX.stone, bumpScale: 1.4, roughness: 0.88 });
  const occluders = OUTLINES.map((o) => {
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(outlinePts(o)), {
      depth: 2.2, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 2,
    }).rotateX(-Math.PI / 2).translate(0, TOP - 2.32, 0);
    const m = mesh(geo, [topMat, wallMat]);
    group.add(m);
    return m;
  });

  // Roads: asphalt with world-aligned texture, kerbs, lane paint.
  const asphaltMat = std(PAL.asphalt, { map: TEX.asphalt, bumpMap: TEX.asphalt, bumpScale: 0.6, roughness: 0.85 });
  const kerbs = [], dashes = [], zebras = [];
  for (const r of ROADS) {
    const len = r.hi - r.lo, mid = (r.lo + r.hi) / 2;
    const cx = r.a === "x" ? mid : r.c, cz = r.a === "x" ? r.c : mid;
    const geo = new THREE.PlaneGeometry(r.a === "x" ? len : r.w, r.a === "x" ? r.w : len).rotateX(-Math.PI / 2);
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + cx) / 4, (pos.getZ(i) + cz) / 4);
    const m = mesh(geo, asphaltMat, cx, TOP + 0.006, cz);
    m.castShadow = false;
    group.add(m);
    for (let s = r.lo + 0.25; s < r.hi; s += 0.5) {
      for (const side of [-1, 1]) {
        const q = r.c + side * (r.w / 2 + 0.06);
        const [x, z] = r.a === "x" ? [s, q] : [q, s];
        if (ROADS.some((o) => o !== r && onRoad(o, x, z, 0.1))) continue;
        kerbs.push(r.a === "x" ? [x, TOP + 0.04, z, 0.5, 0.08, 0.12] : [x, TOP + 0.04, z, 0.12, 0.08, 0.5]);
      }
      if (r.w >= 2 && Math.round(s * 2) % 3 === 0) dashes.push(r.a === "x" ? [s, TOP + 0.012, r.c, 0.55, 1, 0.07] : [r.c, TOP + 0.012, s, 0.07, 1, 0.55]);
    }
  }
  for (const [x, z] of [[-8.5, 8], [6.5, 8], [-8.5, -4], [6.5, -4]]) for (let k = -2; k <= 2; k++) zebras.push([x + k * 0.36, TOP + 0.012, z, 0.17, 1, 0.75]);
  group.add(instance(new THREE.BoxGeometry(1, 1, 1), std(PAL.curb, { roughness: 0.8 }), kerbs));
  const paint = new THREE.MeshStandardMaterial({ color: PAL.paint, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 });
  group.add(instance(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), paint, [...dashes, ...zebras], false));
  return { group, occluders, wetMats: [asphaltMat, topMat] };
}
