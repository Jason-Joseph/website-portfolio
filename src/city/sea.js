// The sea: a live mirror of the city. A planar reflection rendered from a camera
// mirrored under the waterline, sampled through rippled normals, blended by a
// Fresnel term, with sun glints and a surf band along every seawall.
import * as THREE from "three";
import { OUTLINES, outlinePts } from "./land.js";

export const WY = 0.72;
// Layer for small details: drawn and shadowed as usual, left out of the reflection.
export const DETAIL = 2;

export function buildSea({ scene, renderer, isPhone }) {
  const reflRT = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType });
  const texMatrix = new THREE.Matrix4();
  const u = {
    tRefl: { value: reflRT.texture }, texMatrix: { value: texMatrix }, uTime: { value: 0 },
    uDeep: { value: new THREE.Color() }, uShallow: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Color() }, uView: { value: new THREE.Vector3(0, -1, 0) }, uReflect: { value: isPhone() ? 0.62 : 0.8 },
    fogColor: { value: new THREE.Color() }, fogNear: { value: 150 }, fogFar: { value: 300 },
  };
  const water = new THREE.Mesh(new THREE.CircleGeometry(240, 64), new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: `
      uniform mat4 texMatrix;
      varying vec4 vRUv; varying vec3 vW; varying float vFogDepth;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vRUv = texMatrix * w;
        vec4 mv = viewMatrix * w; vFogDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D tRefl; uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow;
      uniform vec3 uSun; uniform vec3 uSunCol; uniform vec3 uView; uniform float uReflect;
      uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
      varying vec4 vRUv; varying vec3 vW; varying float vFogDepth;
      void main() {
        vec2 p = vW.xz;
        float a = sin(p.x * 0.8 + uTime * 0.9) * cos(p.y * 0.6 - uTime * 0.7);
        float b = sin((p.x - p.y) * 1.9 + uTime * 1.5);
        float c = sin((p.x + p.y * 0.5) * 3.7 - uTime * 2.3);
        vec3 N = normalize(vec3(a * 0.07 + c * 0.025, 1.0, b * 0.055 + c * 0.025));
        vec4 r = vRUv; r.xy += N.xz * 0.016 * r.w;
        vec3 refl = texture2DProj(tRefl, r).rgb;
        vec3 V = -uView;
        float fres = 0.4 + 0.5 * pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
        vec3 base = mix(uDeep, uShallow, 0.5 + 0.5 * a);
        vec3 col = mix(base, refl, clamp(fres * uReflect, 0.0, 1.0));
        vec3 H = normalize(uSun + V);
        col += uSunCol * pow(max(dot(N, H), 0.0), 240.0) * 2.0;
        col = mix(col, fogColor, smoothstep(fogNear, fogFar, vFogDepth));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  water.rotation.x = -Math.PI / 2; water.position.y = WY; scene.add(water);

  // Surf: a thin band just outside each coastline.
  const foamMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.28, depthWrite: false });
  const foam = new THREE.Group();
  for (const o of OUTLINES) {
    const shape = new THREE.Shape(outlinePts(o, 0.45));
    shape.holes.push(new THREE.Path(outlinePts(o, 0.05)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2), foamMat);
    m.position.y = WY + 0.015; foam.add(m);
  }
  scene.add(foam);

  const mirror = new THREE.OrthographicCamera();
  const up = new THREE.Vector3(), look = new THREE.Vector3();
  // Render what the water sees; `hide` lists objects that must not double up.
  function reflect(cam, target, hide = []) {
    mirror.copy(cam);
    mirror.layers.disable(DETAIL); // street furniture, cars and clouds are too small to read in the water
    mirror.position.y = 2 * WY - cam.position.y;
    up.set(0, 1, 0).applyQuaternion(cam.quaternion); up.y = -up.y;
    mirror.up.copy(up);
    mirror.lookAt(look.set(target.x, 2 * WY - target.y, target.z));
    mirror.updateMatrixWorld(); mirror.updateProjectionMatrix();
    texMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
    const hidden = [water, foam, ...hide];
    hidden.forEach((o) => { o.visible = false; });
    const autoShadows = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(reflRT); renderer.render(scene, mirror); renderer.setRenderTarget(null);
    renderer.shadowMap.autoUpdate = autoShadows;
    hidden.forEach((o) => { o.visible = true; });
  }
  const resize = (w, h) => reflRT.setSize(Math.max(2, Math.round(w)), Math.max(2, Math.round(h)));
  return { u, foamMat, reflect, resize };
}
