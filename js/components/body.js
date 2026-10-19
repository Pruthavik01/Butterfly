import * as THREE from 'three';
import { ink, inkPaper, paper, lines } from '../core/materials.js';
import { Z, toWorld, toWorldAll, mirrorX } from '../utils/coords.js';
import { roughen } from '../utils/random.js';
import {
  smooth, lens, ellipsePoints, hatch, makeFill, makeLine, makeSegments,
} from '../utils/draw.js';
import {
  thorax, thoraxHighlight, fur, head, antennae, abdomen, abdomenFacets, abdomenShade, legs,
} from '../data/body.js';

export function createBody() {
  const group = new THREE.Group();

  // Thorax: dense black hourglass the wing roots fuse into.
  const thoraxPts = roughen(smooth(toWorldAll(thorax), true, 70), 0.6, 4);
  group.add(makeFill(thoraxPts, ink, Z.body));
  const { a, b, w } = thoraxHighlight;
  group.add(makeFill(lens(toWorld(a), toWorld(b), w, 0.5), inkPaper, Z.body + 0.05));

  // Fur: short strokes pointing outward from the thorax edge (not on the tapered bottom).
  const [, furStopY] = toWorld([0, fur.skipBelow]);
  const furSegs = [];
  for (let i = 0; i < thoraxPts.length; i += fur.every) {
    const [x, y] = thoraxPts[i];
    if (y < furStopY) continue;
    const [px, py] = thoraxPts[(i - 1 + thoraxPts.length) % thoraxPts.length];
    const [qx, qy] = thoraxPts[(i + 1) % thoraxPts.length];
    const len = Math.hypot(qx - px, qy - py) || 1;
    const nx = -(qy - py) / len, ny = (qx - px) / len; // outward for this winding
    const l = fur.length * (0.6 + 0.4 * Math.abs(Math.sin(i)));
    furSegs.push([[x, y], [x + nx * l, y + ny * l]]);
  }
  group.add(makeSegments(furSegs, lines.hatch, Z.body));

  // Head: outlined circle on the axis.
  const [hx, hy] = toWorld(head.center);
  const headPts = ellipsePoints(hx, hy, head.r, head.r);
  group.add(makeFill(headPts, paper, Z.body + 0.1));
  group.add(makeLine(headPts, lines.medium, { closed: true, z: Z.body + 0.2 }));

  // Antennae: thin curved stalks ending in solid clubs.
  for (const { path, club } of antennae) {
    group.add(makeLine(smooth(toWorldAll(path), false, 40), lines.thin, { z: Z.body }));
    group.add(makeFill(lens(toWorld(club.a), toWorld(club.b), club.w, 0, 0.35), ink, Z.body));
  }

  // Crystal abdomen: paper fill, thick outline, facet lines, shaded half.
  const crystal = toWorldAll(abdomen);
  group.add(makeFill(crystal, paper, Z.body + 0.1));
  group.add(makeSegments(hatch(toWorldAll(abdomenShade), 45, 3.2), lines.hatch, Z.body + 0.15));
  for (const f of abdomenFacets) group.add(makeLine(toWorldAll(f), lines.thin, { z: Z.body + 0.2 }));
  group.add(makeLine(crystal, lines.thick, { closed: true, z: Z.body + 0.3, rough: 0.6 }));

  for (const leg of legs) {
    const pts = toWorldAll(leg);
    group.add(makeLine(pts, lines.medium, { z: Z.body - 0.1 }));
    group.add(makeLine(mirrorX(pts), lines.medium, { z: Z.body - 0.1 }));
  }

  return group;
}
