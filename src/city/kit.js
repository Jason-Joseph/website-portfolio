// Shared kit for the city: palette, procedural surface textures, the facade
// shader, and small geometry builders. Everything is generated in code, so
// the prototype ships no third-party models or textures.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// An architectural-model palette: stone, concrete, bronze, slate, deep green.
// The only saturated colours by day belong to the data (coral, teal, blue).
export const PAL = {
  paving: "#d8cfbf", plaza: "#e3dccd", curb: "#bdb5a8", seawall: "#a2998b", asphalt: "#3c4047",
  paint: "#e6dfcc", stone: "#d4c9b5", concrete: "#c9c3b8", slate: "#57616d", bronze: "#9a774c",
  leaf: "#536f50", leaf2: "#62794f", bark: "#5f4b3c", glass: "#5d7184", navy: "#25304a",
  white: "#efebe3", terracotta: "#b5644d", gold: "#c9a24e",
};

export const hash = (x, z) => {
  let h = (x * 374761393 + z * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
export const rng = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const jit = (r, a) => (r() - 0.5) * a;

// A grey detail texture: multiplied into a material's colour and reused as its
// bump map. Linear on purpose, so 0.9 grey keeps 90% of the colour.
export function greyTex(size, seed, paint, repeat = 1) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), img = g.createImageData(size, size), r = rng(seed);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = Math.round(THREE.MathUtils.clamp(paint(x, y, r), 0, 1) * 255), i = (y * size + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(repeat, repeat);
  return t;
}

// 256 px tiles; the repeats below make one tile cover 4 × 4 world units.
const TEX_DEFS = {
  // Limestone slabs, one per block, each with its own tone and a fine grain.
  paving: () => greyTex(256, 7, (x, y, r) => {
    const lx = x & 63, ly = y & 63;
    if (lx < 2 || ly < 2) return 0.76;
    return 0.9 + hash(x >> 6, y >> 6) * 0.08 + jit(r, 0.04) + (lx < 4 || ly < 4 ? 0.025 : 0);
  }, 0.25),
  // Fine aggregate with patches of wear.
  asphalt: () => greyTex(256, 13, (x, y, r) => (r() < 0.03 ? 1 : 0.86 + hash(x >> 4, y >> 4) * 0.05 + jit(r, 0.1)), 0.25),
  // Granite ashlar for the seawalls: half-unit courses, staggered blocks.
  stone: () => greyTex(256, 19, (x, y, r) => {
    const row = y >> 5, lx = (x + (row & 1) * 32) & 63, ly = y & 31;
    if (ly < 2 || lx < 2) return 0.64;
    return 0.83 + hash((x + (row & 1) * 32) >> 6, row) * 0.13 + jit(r, 0.05) - (ly > 28 ? 0.04 : 0);
  }, 0.25),
  // Brick in stretcher bond.
  brick: () => greyTex(256, 29, (x, y, r) => {
    const row = y >> 4, off = (row & 1) * 16, lx = (x + off) & 31, ly = y & 15;
    if (ly < 2 || lx < 2) return 0.8;
    return 0.8 + hash((x + off) >> 5, row) * 0.17 + jit(r, 0.06);
  }, 0.5),
};
export const TEX = {};
// Paint the textures one per task, yielding between them, so the page stays responsive.
export async function prepareTextures(pause) {
  for (const [name, make] of Object.entries(TEX_DEFS)) {
    if (TEX[name]) continue;
    TEX[name] = make();
    await pause();
  }
}
// A texture copy with its own repeat, for objects whose UVs run 0..1 per face.
export const texFor = (t, rx, ry = rx) => { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return c; };

// ---- the facade shader ---------------------------------------------------------
// Windows are drawn in world space on every wall: glass that reflects the sky by
// day; after dark each window switches on at its own moment as the evening
// deepens. One shared uniform drives every facade in the city.
export const cityLights = { value: 0 };
export function facadeMat(color, o = {}) {
  const { cols = 2, rows = 1.6, winW = 0.62, winH = 0.56, base = 3.2, rough = 0.62, metal = 0.05, lit = 0.45, map = null } = o;
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, map, bumpMap: map, bumpScale: map ? 0.6 : 1 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uLights = cityLights;
    sh.uniforms.uGrid = { value: new THREE.Vector4(cols, rows, winW, winH) };
    sh.uniforms.uFac = { value: new THREE.Vector2(base, lit) };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vJW;\nvarying vec3 vJN;")
      .replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
        vec4 jw = vec4(transformed, 1.0);
        vec3 jn0 = objectNormal;
        #ifdef USE_INSTANCING
          jw = instanceMatrix * jw;
          jn0 = mat3(instanceMatrix) * jn0;
        #endif
        vJW = (modelMatrix * jw).xyz;
        vJN = normalize(mat3(modelMatrix) * jn0);`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>
        varying vec3 vJW;
        varying vec3 vJN;
        uniform float uLights;
        uniform vec4 uGrid;
        uniform vec2 uFac;
        float jHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float jWin = 0.0;
        vec2 jCell = vec2(0.0);`)
      .replace("#include <color_fragment>", `#include <color_fragment>
        {
          vec3 jn = normalize(vJN);
          float wall = 1.0 - step(0.5, abs(jn.y));
          float ju = abs(jn.x) > abs(jn.z) ? vJW.z : vJW.x;
          float above = step(0.0, vJW.y - uFac.x);
          vec2 jg = vec2(ju * uGrid.x, (vJW.y - uFac.x) * uGrid.y);
          jCell = floor(jg) + floor(vJW.xz * 0.37) * 13.0 + (abs(jn.x) > abs(jn.z) ? 0.0 : 71.0);
          vec2 jf = fract(jg);
          float hx = 0.5 * (1.0 - uGrid.z), hy = 0.5 * (1.0 - uGrid.w);
          jWin = wall * above * step(hx, jf.x) * step(jf.x, 1.0 - hx) * step(hy, jf.y) * step(jf.y, 1.0 - hy);
          float grain = jHash(floor(vec2(ju, vJW.y) * 24.0));
          float slab = wall * above * (1.0 - step(0.05, fract(jg.y + 0.025)));
          diffuseColor.rgb *= (0.955 + grain * 0.045) * (1.0 - slab * 0.16);
          vec3 glassTint = mix(vec3(0.17, 0.21, 0.26), vec3(0.24, 0.25, 0.27), step(0.7, jHash(jCell * 2.3)));
          diffuseColor.rgb = mix(diffuseColor.rgb, glassTint, jWin);
        }`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.12, jWin);`)
      .replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, 0.88, jWin);`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        {
          float lit = step(jHash(jCell), uLights * uFac.y);
          vec3 warm = mix(vec3(1.0, 0.68, 0.38), vec3(0.72, 0.83, 1.0), step(0.84, jHash(jCell * 1.7)));
          totalEmissiveRadiance += jWin * lit * warm * (0.75 + 0.45 * jHash(jCell * 3.1));
        }`);
  };
  return m;
}

// ---- draw-call budget ------------------------------------------------------------
// Merge a container's static meshes that share a material into one mesh each, and
// recurse into child groups. Parts that move on their own carry userData.live and
// are left alone; so are instanced meshes and multi-material meshes.
export function mergeStatic(container) {
  const byMat = new Map();
  for (const o of [...container.children]) {
    if (o.userData.live) continue;
    if (!o.isMesh && o.children.length) { mergeStatic(o); continue; }
    if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || o.isSkinnedMesh) continue;
    if (!byMat.has(o.material)) byMat.set(o.material, []);
    byMat.get(o.material).push(o);
  }
  for (const [mat, list] of byMat) {
    if (list.length < 2) continue;
    const geos = list.map((o) => {
      o.updateMatrix();
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.clearGroups();
      return g.applyMatrix4(o.matrix);
    });
    const shared = Object.keys(geos[0].attributes).filter((n) => geos.every((g) => g.attributes[n]));
    geos.forEach((g) => Object.keys(g.attributes).forEach((n) => { if (!shared.includes(n)) g.deleteAttribute(n); }));
    const merged = mergeGeometries(geos);
    if (!merged) continue;
    const m = new THREE.Mesh(merged, mat);
    m.castShadow = list.some((o) => o.castShadow);
    m.receiveShadow = list.some((o) => o.receiveShadow);
    m.userData = { ...list[0].userData };
    list.forEach((o) => container.remove(o));
    container.add(m);
  }
}

// ---- builders ------------------------------------------------------------------
export const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...extra });
export const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2));
export function mesh(geo, mat, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  return m;
}
const m4 = new THREE.Matrix4(), qv = new THREE.Quaternion(), eul = new THREE.Euler(), vv = new THREE.Vector3(), sv = new THREE.Vector3();
// One instanced mesh from a list of [x, y, z, sx, sy, sz, rotY, rotX].
export function instance(geo, mat, list, cast = true) {
  const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
  im.count = list.length;
  list.forEach(([x, y, z, sx = 1, sy = 1, sz = 1, ry = 0, rx = 0], i) => {
    m4.compose(vv.set(x, y, z), qv.setFromEuler(eul.set(rx, ry, 0)), sv.set(sx, sy, sz)); im.setMatrixAt(i, m4);
  });
  im.castShadow = cast; im.receiveShadow = true;
  return im;
}

// A tree canopy: a few overlapping smooth lobes, so it reads as foliage, not a ball.
export function canopyGeo() {
  const lobes = [[0, 0, 0, 0.6], [0.34, 0.16, 0.12, 0.44], [-0.3, 0.1, -0.16, 0.47], [0.06, 0.4, -0.06, 0.4], [-0.08, 0.05, 0.36, 0.4]];
  return mergeGeometries(lobes.map(([x, y, z, s]) => new THREE.IcosahedronGeometry(s, 2).translate(x, y, z)));
}
// Palm fronds: arched blades fanned around the crown.
export function frondGeo(count = 8) {
  const blades = [];
  for (let i = 0; i < count; i++) {
    const g = new THREE.PlaneGeometry(1.7, 0.36, 8, 1).rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k) + 0.85;
      p.setX(k, x); p.setY(k, 0.25 * x - 0.32 * x * x); p.setZ(k, p.getZ(k) * (1 - x / 2));
    }
    g.computeVertexNormals();
    blades.push(g.rotateY((i / count) * Math.PI * 2 + (i % 2) * 0.2));
  }
  return mergeGeometries(blades);
}
// A gabled roof prism, ridge along x.
export function gableGeo(w, h, d) {
  const s = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, h)]);
  return new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }).translate(0, 0, -w / 2).rotateY(Math.PI / 2);
}
// A small car, nose towards +x.
export function carGroup(len, color, { glass = "#1d2430" } = {}) {
  const g = new THREE.Group(), w = 0.5 + len * 0.06, h = 0.28 + len * 0.05;
  g.add(mesh(rbox(len, h, w, 0.1), std(color, { roughness: 0.32, metalness: 0.45 }), 0, 0.12 + h / 2, 0));
  g.add(mesh(rbox(len * 0.55, h * 0.75, w * 0.88, 0.08), std(glass, { roughness: 0.08, metalness: 0.85 }), -len * 0.06, 0.12 + h + h * 0.3, 0));
  const tyre = std("#1b1d22", { roughness: 0.85 }), wheel = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 14).rotateX(Math.PI / 2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(wheel, tyre, sx * len * 0.32, 0.14, sz * (w / 2 - 0.02)));
  return g;
}
