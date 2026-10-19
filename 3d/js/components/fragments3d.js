import * as THREE from 'three';
import { obsidian, glass, frostedGlass, edgeLine } from '../core/materials.js';
import { centroid, crystal, withEdges } from '../utils/geometry3d.js';
import { toWorld, toWorldAll } from '../../../js/utils/coords.js';
import { hash2 } from '../../../js/utils/random.js';
import { shards, dots, rings } from '../../../js/data/fragments.js';

const MATERIAL = { solid: obsidian, outline: glass, hatch: frostedGlass };

// Same positions as the 2D fragments, spread through depth (local z).
function place(mesh, x, y) {
  mesh.position.set(x, y, hash2(x, y, 5) * 80 + 10);
  mesh.rotation.set(hash2(x, 1) * Math.PI, hash2(y, 2) * Math.PI, 0);
  mesh.userData = { base: mesh.position.clone(), rot: mesh.rotation.clone(), phase: hash2(x, y) * Math.PI };
  mesh.castShadow = mesh.material === obsidian;
  return mesh;
}

export function createFragments3d() {
  const group = new THREE.Group();

  for (const { pts, style } of shards) {
    const world = toWorldAll(pts);
    const [cx, cy] = centroid(world);
    const local = world.map(([x, y]) => [x - cx, y - cy]);
    const size = Math.max(...local.map(([x, y]) => Math.hypot(x, y)));
    const mesh = new THREE.Mesh(crystal(local, size * 0.45, size * 0.3), MATERIAL[style]);
    if (style !== 'solid') withEdges(mesh, edgeLine);
    group.add(place(mesh, cx, cy));
  }

  for (const [x, y, r] of dots) {
    const [wx, wy] = toWorld([x, y]);
    group.add(place(new THREE.Mesh(new THREE.SphereGeometry(r * 1.2, 16, 12), obsidian), wx, wy));
  }
  for (const [x, y, r] of rings) {
    const [wx, wy] = toWorld([x, y]);
    group.add(place(new THREE.Mesh(new THREE.TorusGeometry(r * 1.5, 0.8, 8, 32), obsidian), wx, wy));
  }
  return group;
}
