// Jason as a detailed micro-voxel figure: soft-bevelled voxels, chibi
// proportions, glasses, navy blazer over a black shirt, at a standing desk with
// a laptop. Arms and head are separate groups so they can wave and turn.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { hash, std, rbox, mesh, canopyGeo } from "./kit.js";

const V = 0.095; // one voxel, in world units
const C = {
  skin: "#e0bb96", skinShade: "#cfa57f", hair: "#1d1a19", hairHi: "#2c2724",
  navy: "#25304a", navyShade: "#1d263c", lapel: "#33405f", tee: "#1e1f24",
  trousers: "#2f3440", shoe: "#18181b", frame: "#26292f", eye: "#19191b", mouth: "#a9675b", button: "#151b2b",
};

class Vox {
  constructor() { this.m = new Map(); }
  set(x, y, z, c) { this.m.set(`${x},${y},${z}`, c); return this; }
  box(x0, y0, z0, w, h, d, c) {
    for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) for (let z = z0; z < z0 + d; z++) this.set(x, y, z, c);
    return this;
  }
}
const cube = new RoundedBoxGeometry(V, V, V, 1, V * 0.07);
const voxMat = std("#ffffff", { roughness: 0.6 });
const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
// Only voxels with an exposed face become instances; each gets a faint tone shift.
function build(vox, ox = 0, oy = 0.5, oz = 0) {
  const list = [...vox.m].filter(([k]) => {
    const [x, y, z] = k.split(",").map(Number);
    return SIDES.some(([a, b, c]) => !vox.m.has(`${x + a},${y + b},${z + c}`));
  });
  const im = new THREE.InstancedMesh(cube, voxMat, list.length);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  list.forEach(([k, hex], i) => {
    const [x, y, z] = k.split(",").map(Number);
    m4.makeTranslation((x + ox) * V, (y + oy) * V, (z + oz) * V);
    im.setMatrixAt(i, m4);
    im.setColorAt(i, col.set(hex).multiplyScalar(0.96 + hash(x * 7 + y, z * 3 - y) * 0.07));
  });
  im.castShadow = im.receiveShadow = true;
  return im;
}

function bodyVox() {
  const b = new Vox();
  b.box(-4, 0, -2, 4, 2, 6, C.shoe).box(1, 0, -2, 4, 2, 6, C.shoe);
  b.box(-4, 2, -2, 4, 6, 4, C.trousers).box(1, 2, -2, 4, 6, 4, C.trousers);
  b.box(-5, 8, -3, 11, 8, 6, C.navy);
  b.box(-5, 8, -3, 11, 1, 6, C.navyShade); // hem
  // The open blazer: a black shirt in a V, lapels either side, one button.
  [[15, 2], [14, 1], [13, 1], [12, 0], [11, 0]].forEach(([y, w]) => {
    for (let x = -w; x <= w; x++) b.set(x, y, 2, C.tee);
    b.set(-w - 1, y, 2, C.lapel).set(w + 1, y, 2, C.lapel);
  });
  b.set(0, 10, 2, C.button).set(0, 9, 2, C.navyShade);
  b.box(-1, 16, -1, 3, 1, 3, C.skinShade); // neck
  return b;
}
function armVox() {
  const a = new Vox();
  a.box(0, -8, -1, 2, 8, 3, C.navy).box(0, -8, -1, 2, 1, 3, C.tee); // sleeve, cuff
  a.box(0, -10, -1, 2, 2, 3, C.skin);
  return a;
}
function headVox() {
  const h = new Vox();
  h.box(-7, 0, -6, 15, 12, 12, C.skin);
  h.box(-7, 0, 5, 15, 1, 1, C.skinShade); // jaw shadow
  // Hair: a thin shell over the top, back and sides, parted with a side-swept
  // fringe, highlights on the crown and a few tufts.
  h.box(-8, 11, -7, 17, 3, 14, C.hair).box(-8, 1, -7, 17, 13, 2, C.hair);
  h.box(-8, 6, -7, 1, 8, 9, C.hair).box(8, 6, -7, 1, 8, 9, C.hair);
  for (let x = -7; x <= 3; x++) h.set(x, 10, 6, C.hair);
  for (let x = -7; x <= -3; x++) h.set(x, 9, 6, C.hair);
  for (let x = 4; x <= 7; x++) h.set(x, 10, 6, C.hairHi);
  for (let x = -8; x <= 8; x++) for (let z = -7; z <= 6; z++) if (hash(x * 3, z * 5) > 0.62) h.set(x, 13, z, C.hairHi);
  [[-3, 14, 0], [-2, 14, 1], [1, 14, -1], [2, 14, 0], [4, 14, -2], [-5, 14, -2], [0, 14, 2], [-1, 15, 1]].forEach(([x, y, z]) => h.set(x, y, z, C.hairHi));
  // Ears.
  for (const s of [-1, 1]) { h.box(s * 8, 4, -1, 1, 3, 2, C.skin); h.box(s * 9, 5, -1, 1, 1, 2, C.skinShade); }
  // Eyes, brows, nose, a small smile.
  h.box(-4, 5, 5, 2, 2, 1, C.eye).box(3, 5, 5, 2, 2, 1, C.eye);
  h.set(-3, 6, 5, "#3b3b3f").set(4, 6, 5, "#3b3b3f");
  for (let x = 2; x <= 5; x++) h.set(x, 8, 6, C.hair).set(-x, 8, 6, C.hair); // brows
  h.set(0, 4, 6, C.skinShade);
  for (let x = -1; x <= 1; x++) h.set(x, 2, 6, C.mouth);
  h.set(-2, 3, 6, C.mouth).set(2, 3, 6, C.mouth);
  // Glasses: two frames on the face, a bridge, temples running back.
  for (const cx of [-6, 1]) for (let x = cx; x < cx + 6; x++) for (let y = 4; y <= 7; y++) {
    if (x === cx || x === cx + 5 || y === 4 || y === 7) h.set(x, y, 6, C.frame);
  }
  h.set(0, 6, 6, C.frame);
  for (const s of [-1, 1]) for (let z = 0; z <= 5; z++) h.set(s * 8, 6, z, C.frame);
  return h;
}

export function buildJason() {
  const me = new THREE.Group();
  me.add(build(bodyVox()));
  const arm = (sx) => {
    const g = new THREE.Group(); g.position.set(sx * 6.5 * V, 16 * V, 0);
    g.add(build(armVox(), -0.5, 0.5, 0)); me.add(g); return g;
  };
  const armL = arm(-1), armR = arm(1);
  const head = new THREE.Group(); head.position.set(0, 17 * V, 0);
  head.add(build(headVox())); me.add(head);

  // The workstation: a standing desk, a laptop with a live chart, a mug, a plant.
  const station = new THREE.Group();
  const oak = std("#b48a5f", { roughness: 0.55 }), steel = std("#2c3038", { roughness: 0.35, metalness: 0.7 });
  station.add(mesh(rbox(1.6, 0.07, 0.8, 0.02), oak, 0, 1.15, 0));
  for (const x of [-0.68, 0.68]) station.add(mesh(rbox(0.07, 1.12, 0.62, 0.02), steel, x, 0.56, 0));
  station.add(mesh(rbox(1.3, 0.05, 0.05, 0.01), steel, 0, 0.3, 0));
  const shell = std("#c9ccd1", { roughness: 0.3, metalness: 0.75 });
  station.add(mesh(rbox(0.62, 0.035, 0.42, 0.015), shell, 0.1, 1.205, 0.05));
  const lid = new THREE.Group(); lid.position.set(0.1, 1.22, -0.16); lid.rotation.x = -0.28;
  lid.add(mesh(rbox(0.62, 0.42, 0.03, 0.015), shell, 0, 0.21, 0));
  const chart = (() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 86;
    const g = c.getContext("2d");
    g.fillStyle = "#0f1626"; g.fillRect(0, 0, 128, 86);
    g.strokeStyle = "#2a3550"; g.lineWidth = 1;
    for (let y = 18; y < 80; y += 15) { g.beginPath(); g.moveTo(10, y); g.lineTo(120, y); g.stroke(); }
    [0.44, 0.62, 0.5, 0.78, 0.58, 0.7].forEach((v, i) => { g.fillStyle = i === 3 ? "#e8735a" : "#5b8def"; g.fillRect(14 + i * 17, 78 - v * 60, 10, v * 60); });
    g.strokeStyle = "#5fd0b5"; g.lineWidth = 2; g.beginPath();
    [0.3, 0.42, 0.38, 0.6, 0.52, 0.66].forEach((v, i) => (i ? g.lineTo(19 + i * 17, 78 - v * 60) : g.moveTo(19, 78 - v * 60))); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const screenMat = new THREE.MeshStandardMaterial({ map: chart, emissiveMap: chart, emissive: "#ffffff", emissiveIntensity: 0.5, roughness: 0.25 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.37), screenMat); screen.position.set(0, 0.21, 0.017); lid.add(screen);
  station.add(lid);
  station.add(mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.12, 18), std("#efebe3", { roughness: 0.4 }), -0.5, 1.245, 0.12));
  station.add(mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.14, 18), std("#b5644d", { roughness: 0.7 }), 0.62, 1.255, -0.22));
  const plant = mesh(canopyGeo(), std("#4f6f4c", { roughness: 0.85 }), 0.62, 1.42, -0.22); plant.scale.setScalar(0.2); station.add(plant);
  return { me, head, armL, armR, station, screenMat, height: 32 * V };
}
