import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Mid-tone slate: darker than glass highlights, lighter than obsidian,
// so both read clearly.
const SKY_TOP = '#6a707a';
const SKY_BOTTOM = '#2f3238';
const FLOOR = 0x3a3e45;
const FLOOR_Y = -170;

function gradientBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, SKY_TOP);
  g.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = gradientBackground();
  scene.fog = new THREE.Fog(SKY_BOTTOM, 1600, 3600);

  // Soft studio reflections for the obsidian and glass.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 10, 6000);
  camera.position.set(0, 520, 760);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, -20, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 350;
  controls.maxDistance = 1600;
  controls.maxPolarAngle = Math.PI * 0.47; // stay above the floor
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  // Pause the slow turntable while the user drags, resume after a few idle seconds.
  let resumeTimer;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    clearTimeout(resumeTimer);
  });
  controls.addEventListener('end', () => {
    resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 4000);
  });

  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfb8aa, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(300, 700, 300);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -600, right: 600, top: 600, bottom: -600, near: 100, far: 2000 });
  key.shadow.bias = -0.0005;
  scene.add(key);

  // Cool rim light from behind: outlines the black obsidian edges.
  const rim = new THREE.DirectionalLight(0x9fc4ff, 1.6);
  rim.position.set(0, 250, -700);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(6000, 6000),
    new THREE.MeshStandardMaterial({ color: FLOOR, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  scene.add(floor);

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  return { renderer, scene, camera, controls };
}
