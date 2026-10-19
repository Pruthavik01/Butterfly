import * as THREE from 'three';
import { lines } from '../core/materials.js';
import { Z, toWorld, toWorldAll } from '../utils/coords.js';
import { arcPoints, makeLine, makeSegments } from '../utils/draw.js';
import { circle, headGuide, strokes, ticks } from '../data/pencil.js';

export function createPencil() {
  const group = new THREE.Group();

  for (const s of strokes) group.add(makeLine(toWorldAll(s), lines.pencil, { z: Z.pencil, rough: 0.5 }));

  for (const { center, r } of [circle, headGuide]) {
    const [cx, cy] = toWorld(center);
    group.add(makeLine(arcPoints(cx, cy, r, 0, 360), lines.pencil, { z: Z.pencil }));
  }

  const tickSegs = [];
  for (let y = ticks.from; y <= ticks.to; y += ticks.step) {
    tickSegs.push([toWorld([ticks.x - ticks.size, y]), toWorld([ticks.x + ticks.size, y])]);
  }
  group.add(makeSegments(tickSegs, lines.pencil, Z.pencil));

  return group;
}
