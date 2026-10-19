import * as THREE from 'three';
import { ink, inkPaper } from '../core/materials.js';
import { Z, toWorld, toWorldAll } from '../utils/coords.js';
import { roughen } from '../utils/random.js';
import { smooth, lens, facetize, makeMorphFill, makeDot } from '../utils/draw.js';
import { wings } from '../data/upperWing.js';

function buildWing({ silhouette, markings, dots }, seed, morphs) {
  const group = new THREE.Group();

  // Solid black silhouette with an irregular inked edge; its morph target is
  // an angular, faceted version of the same outline.
  const outline = roughen(smooth(toWorldAll(silhouette), true, 200), 1.6, seed);
  const wing = makeMorphFill(outline, facetize(outline, 11), ink, Z.upper);
  group.add(wing);
  morphs.push(wing);

  // White cells layered on top, each morphing to a small polygon.
  markings.forEach(({ a, b, w, bend = 0, peak = 0.5 }, i) => {
    const cell = roughen(lens(toWorld(a), toWorld(b), w, bend, peak), 0.6, seed * 50 + i);
    const mesh = makeMorphFill(cell, facetize(cell, 5), inkPaper, Z.markings);
    group.add(mesh);
    morphs.push(mesh);
  });

  for (const [x, y, r] of dots) {
    const [wx, wy] = toWorld([x, y]);
    group.add(makeDot(wx, wy, r, inkPaper, Z.markings));
  }
  return group;
}

export function createUpperWings() {
  const morphs = [];
  return {
    left: buildWing(wings.left, 1, morphs),
    right: buildWing(wings.right, 2, morphs),
    morphs,
  };
}
