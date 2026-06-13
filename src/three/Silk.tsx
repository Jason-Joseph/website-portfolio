// ---------------------------------------------------------------------------
// Silk.tsx
// The three.js layer: a field of fine contour lines displaced by layered
// sine waves in the vertex shader — a dark silk surface rolling slowly
// under the page, crests catching an electric-cobalt light. One draw call;
// all motion on the GPU. Pointer tilts the surface a few degrees; scroll
// feeds the wave phase; uMix lerps the palette toward the light theme in
// step with the CSS crossfade.
// ---------------------------------------------------------------------------

import { memo, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  ShaderMaterial,
} from "three";
import { motionPref, themeState } from "../lib/motion";

const ROWS = 90;
const COLS = 200;
const WIDTH = 30;
const Z_NEAR = 2;
const Z_FAR = -16;

const pointer = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  varying float vElev;
  varying vec3 vPos;

  void main() {
    vec3 p = position;
    float t = uTime * 0.32 + uScroll * 4.0;

    float e = 0.0;
    e += sin(p.x * 0.50 + t)              * 0.42;
    e += sin(p.z * 0.80 + t * 1.30)       * 0.28;
    e += sin((p.x + p.z) * 0.30 - t * 0.7) * 0.50;
    e += sin(p.x * 1.70 - t * 1.60)       * 0.07;

    p.y += e;
    vElev = e;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uBaseDark;
  uniform vec3 uCrestDark;
  uniform vec3 uBaseLight;
  uniform vec3 uCrestLight;
  uniform float uMix; // 0 = dark theme, 1 = light theme
  varying float vElev;
  varying vec3 vPos;

  void main() {
    float crest = smoothstep(0.25, 1.15, vElev);
    vec3 base = mix(uBaseDark, uBaseLight, uMix);
    vec3 crestC = mix(uCrestDark, uCrestLight, uMix);
    vec3 col = mix(base, crestC, crest * 0.9);

    // Fade into the distance and at the side edges.
    float fadeFar = smoothstep(-16.0, -8.5, vPos.z);
    float fadeX = 1.0 - smoothstep(9.0, 15.0, abs(vPos.x));
    float strength = mix(1.0, 0.65, uMix); // quieter over the light band
    float alpha = (0.10 + crest * 0.5) * fadeFar * fadeX * strength;

    gl_FragColor = vec4(col, alpha);
  }
`;

function buildLines(): BufferGeometry {
  const verts: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    const z = Z_FAR + (r / (ROWS - 1)) * (Z_NEAR - Z_FAR);
    for (let i = 0; i < COLS - 1; i++) {
      const x0 = -WIDTH / 2 + (i / (COLS - 1)) * WIDTH;
      const x1 = -WIDTH / 2 + ((i + 1) / (COLS - 1)) * WIDTH;
      verts.push(x0, 0, z, x1, 0, z);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(verts, 3));
  return geo;
}

function Surface() {
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(buildLines, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMix: { value: 0 },
      uBaseDark: { value: new Color("#2b2f3e") },
      uCrestDark: { value: new Color("#6e85ff") },
      uBaseLight: { value: new Color("#b9bdcc") },
      uCrestLight: { value: new Color("#3d56e8") },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (motionPref.reduced) return;
    if (material.current) {
      const u = material.current.uniforms;
      u.uTime.value += delta;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      u.uScroll.value = max > 0 ? window.scrollY / max : 0;
      // Track the CSS theme crossfade (~0.7s) with a matching lerp.
      const k = 1 - Math.exp(-4.5 * delta);
      u.uMix.value += (themeState.target - u.uMix.value) * k;
    }
    if (group.current) {
      const k = 1 - Math.exp(-2.0 * delta);
      group.current.rotation.z += (pointer.x * 0.04 - group.current.rotation.z) * k;
      group.current.rotation.x += (pointer.y * 0.03 - group.current.rotation.x) * k;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geometry}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function Silk() {
  return (
    <div className="backdrop" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 50, near: 0.1, far: 50, position: [0, 2.6, 7] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Surface />
      </Canvas>
    </div>
  );
}

export default memo(Silk);
