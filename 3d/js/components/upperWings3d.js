import * as THREE from 'three';
import { wingObsidian as obsidian, wingGlass as milkyGlass, wingDepth } from '../core/materials.js';
import { shapeFrom, pathFrom, circlePath, slab } from '../utils/geometry3d.js';
import { toWorld, toWorldAll } from '../../../js/utils/coords.js';
import { roughen } from '../../../js/utils/random.js';
import { smooth, lens } from '../../../js/utils/draw.js';
import { wings } from '../../../js/data/upperWing.js';

// Obsidian wing with every white cell and dot cut out as a hole, each hole
// filled with a milky glass window. Same outlines as the 2D version.
function buildWing({ silhouette, markings, dots }, seed) {
  const group = new THREE.Group();
  const outline = roughen(smooth(toWorldAll(silhouette), true, 200), 1.6, seed);
  const shape = shapeFrom(outline);

  markings.forEach(({ a, b, w, bend = 0, peak = 0.5 }, i) => {
    const cell = roughen(lens(toWorld(a), toWorld(b), w, bend, peak), 0.6, seed * 50 + i);
    shape.holes.push(pathFrom(cell));
    group.add(new THREE.Mesh(new THREE.ShapeGeometry(shapeFrom(cell)), milkyGlass));
  });

  for (const [x, y, r] of dots) {
    const [wx, wy] = toWorld([x, y]);
    shape.holes.push(circlePath(wx, wy, r));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 20), milkyGlass);
    disc.position.set(wx, wy, 0);
    group.add(disc);
  }

  const frame = new THREE.Mesh(slab(shape, 3, 0.6), obsidian);
  frame.castShadow = true;
  frame.customDepthMaterial = wingDepth;
  group.add(frame);
  return group;
}

export function createUpperWings3d() {
  return { left: buildWing(wings.left, 1), right: buildWing(wings.right, 2) };
}
