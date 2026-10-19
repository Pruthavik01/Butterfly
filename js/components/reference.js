import * as THREE from 'three';
import { Z, IMAGE_SIZE, CX } from '../utils/coords.js';

// Dev aid: the original drawing as a translucent overlay for tracing.
export function createReferenceOverlay(url = 'assets/reference.jpg') {
  const texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(IMAGE_SIZE, IMAGE_SIZE),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.4, depthTest: false })
  );
  mesh.position.set(IMAGE_SIZE / 2 - CX, 0, Z.overlay);
  mesh.visible = false;
  return mesh;
}
