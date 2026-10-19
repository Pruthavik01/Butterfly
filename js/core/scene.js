import * as THREE from 'three';
import { PAPER_COLOR, updateLineMaterials } from './materials.js';
import { IMAGE_SIZE, CX } from '../utils/coords.js';

const FRAME = IMAGE_SIZE * 1.04; // the drawing plus a small margin

export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(PAPER_COLOR);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // Centre the camera on the image centre, not the body axis.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
  camera.position.set(IMAGE_SIZE / 2 - CX, 0, 100);

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    const scale = Math.min(w, h) / FRAME;
    camera.left = -w / scale / 2;
    camera.right = w / scale / 2;
    camera.top = h / scale / 2;
    camera.bottom = -h / scale / 2;
    camera.updateProjectionMatrix();
    updateLineMaterials(w, h, scale);
  }

  window.addEventListener('resize', resize);
  resize();

  return { renderer, scene, camera };
}
