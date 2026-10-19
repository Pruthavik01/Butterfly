import * as THREE from 'three';
import { obsidian, glass, milkyGlass, edgeLine } from '../core/materials.js';
import { lathe, withEdges } from '../utils/geometry3d.js';
import { toWorld, toWorldAll, mirrorX } from '../../../js/utils/coords.js';
import { smooth } from '../../../js/utils/draw.js';
import { thorax, head, antennae, abdomen, legs } from '../../../js/data/body.js';

// Right half of a symmetric outline as a lathe profile [radius, y], bottom to top.
const profileOf = (pts) =>
  toWorldAll(pts)
    .filter(([x]) => x >= -0.01)
    .map(([x, y]) => [Math.max(0, x), y])
    .sort((p, q) => p[1] - q[1]);

function tube(points3, radius) {
  const curve = new THREE.CatmullRomCurve3(points3.map((p) => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, radius, 8), obsidian);
  mesh.castShadow = true;
  return mesh;
}

export function createBody3d() {
  const group = new THREE.Group();

  // Thorax: smooth obsidian spindle, slightly flattened top-to-bottom.
  const chest = new THREE.Mesh(lathe(profileOf(thorax), 32), obsidian);
  chest.scale.z = 0.75;
  chest.castShadow = true;
  group.add(chest);

  // Head: milky glass bead.
  const [hx, hy] = toWorld(head.center);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(head.r, 32, 24), milkyGlass);
  bead.position.set(hx, hy, 0);
  group.add(bead);

  // Abdomen: hexagonal glass crystal (6 lathe segments, flat shaded).
  group.add(withEdges(new THREE.Mesh(lathe(profileOf(abdomen), 6), glass), edgeLine));

  // Antennae curve up off the wing plane and end in obsidian clubs.
  for (const { path, club } of antennae) {
    const pts = smooth(toWorldAll(path), false, 12).map(([x, y], i, all) => [x, y, (i / (all.length - 1)) * 20]);
    group.add(tube(pts, 1));
    const [ax, ay] = toWorld(club.a), [bx, by] = toWorld(club.b);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), obsidian);
    tip.scale.set(club.w / 2, Math.hypot(bx - ax, by - ay) / 2, club.w / 2);
    tip.position.set((ax + bx) / 2, (ay + by) / 2, 22);
    tip.rotation.z = Math.atan2(by - ay, bx - ax) - Math.PI / 2;
    tip.castShadow = true;
    group.add(tip);
  }

  // Legs hang down below the wing plane, both sides.
  for (const leg of legs) {
    const pts = toWorldAll(leg);
    for (const side of [pts, mirrorX(pts)]) group.add(tube(side.map(([x, y], i) => [x, y, -i * 8]), 0.9));
  }

  return group;
}
