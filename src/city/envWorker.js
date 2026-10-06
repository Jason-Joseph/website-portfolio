// Builds the city's reflection environment off the main thread. The PMREM blur
// shader takes over a second to compile on some drivers (Direct3D on Windows),
// which would freeze the page; in a worker it only occupies this thread.
import { WebGLRenderer, PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

self.onmessage = () => {
  try {
    const renderer = new WebGLRenderer({ canvas: new OffscreenCanvas(1, 1) });
    const target = new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04);
    const data = new Uint16Array(target.width * target.height * 4); // half floats
    renderer.readRenderTargetPixels(target, 0, 0, target.width, target.height, data);
    self.postMessage({ width: target.width, height: target.height, data }, [data.buffer]);
    renderer.dispose();
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
};
