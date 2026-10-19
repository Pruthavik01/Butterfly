import * as THREE from 'three';
import { ink, paper, lines } from '../core/materials.js';
import { Z, toWorld, toWorldAll } from '../utils/coords.js';
import { hash2 } from '../utils/random.js';
import {
  ellipsePoints, hatch, makeFill, makeLine, makeSegments, makeDot,
} from '../utils/draw.js';
import { shards, dots, rings } from '../data/fragments.js';

// Each fragment is a group centred on its own centroid so it can drift/rotate in place.
function place(group, x, y) {
  group.position.set(x, y, Z.fragments);
  group.userData = { base: group.position.clone(), phase: hash2(x, y) * Math.PI, rot: 0 };
  return group;
}

function buildShard({ pts, style, inner = [] }) {
  const world = toWorldAll(pts);
  const cx = world.reduce((s, p) => s + p[0], 0) / world.length;
  const cy = world.reduce((s, p) => s + p[1], 0) / world.length;
  const local = (list) => list.map(([x, y]) => [x - cx, y - cy]);
  const shape = local(world);

  const group = new THREE.Group();
  if (style === 'solid') {
    group.add(makeFill(shape, ink, 0));
  } else {
    group.add(makeFill(shape, paper, 0));
    group.add(makeLine(shape, lines.medium, { closed: true, z: 0.2, rough: 0.8 }));
  }
  if (style === 'hatch') group.add(makeSegments(hatch(shape, 60, 3.5), lines.hatch, 0.1));
  for (const edge of inner) group.add(makeLine(local(toWorldAll(edge)), lines.thin, { z: 0.1 }));

  return place(group, cx, cy);
}

export function createFragments() {
  const group = new THREE.Group();
  for (const shard of shards) group.add(buildShard(shard));

  for (const [x, y, r] of dots) {
    const [wx, wy] = toWorld([x, y]);
    group.add(place(new THREE.Group().add(makeDot(0, 0, r, ink)), wx, wy));
  }
  for (const [x, y, r] of rings) {
    const [wx, wy] = toWorld([x, y]);
    group.add(place(new THREE.Group().add(makeLine(ellipsePoints(0, 0, r, r), lines.thin, { closed: true })), wx, wy));
  }
  return group;
}
