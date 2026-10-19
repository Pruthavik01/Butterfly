import * as THREE from 'three';
import { paper, lines } from '../core/materials.js';
import { Z, toWorldAll, mirrorX } from '../utils/coords.js';
import { jitter, wobble, hash2 } from '../utils/random.js';
import { hatch, makeFill, makeLine, makeSegments } from '../utils/draw.js';
import { facets, sides } from '../data/lowerWing.js';

// An edge used by only one facet lies on the wing's outer boundary.
const edgeKey = (p, q) => [p.join(), q.join()].sort().join('|');
const edgeUsage = new Map();
for (const f of facets) {
  f.forEach((p, i) => {
    const k = edgeKey(p, f[(i + 1) % f.length]);
    edgeUsage.set(k, (edgeUsage.get(k) || 0) + 1);
  });
}

// Each facet is its own "shard" group (centred on its centroid) so it can
// break away from the wing; outer edges are drawn thick on the shard itself.
function buildWing(cfg, mirrored) {
  const toSide = (pts) => {
    const w = toWorldAll(pts);
    return jitter(mirrored ? mirrorX(w) : w, cfg.jitter, cfg.seed);
  };
  const group = new THREE.Group();
  const shards = [];

  facets.forEach((facet, fi) => {
    const pts = toSide(facet);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const local = (list) => list.map(([x, y]) => [x - cx, y - cy]);

    const shard = new THREE.Group();
    shard.position.set(cx, cy, Z.lower + fi * 0.01);

    const fill = makeFill(local(pts), paper, 0);
    shard.add(fill);
    // Wobble in world space so an edge shared by two facets bends identically.
    shard.add(makeLine(local(wobble(pts, 1, true)), lines.thin, { closed: true, z: 0.2 }));
    facet.forEach((p, i) => {
      const q = facet[(i + 1) % facet.length];
      if (edgeUsage.get(edgeKey(p, q)) === 1) {
        shard.add(makeLine(local(wobble(toSide([p, q]), 1)), lines.thick, { z: 0.3 }));
      }
    });
    const h = cfg.hatch.find((item) => item.facet === fi);
    if (h) shard.add(makeSegments(hatch(local(pts), h.angle, h.spacing), lines.hatch, 0.1));

    const len = Math.hypot(cx, cy) || 1;
    shard.userData = {
      fill,
      base: shard.position.clone(),
      dir: new THREE.Vector2(cx / len, cy / len),
      dist: 30 + 20 * (hash2(fi, cfg.seed) + 1),
      spin: hash2(cfg.seed, fi) * 0.5,
      phase: hash2(fi, fi + cfg.seed) * Math.PI,
    };
    group.add(shard);
    shards.push(shard);
  });

  group.add(makeLine(toSide(cfg.dashed), lines.dashed, { z: Z.lower + 0.25 }));
  return { group, shards };
}

export function createLowerWings() {
  const left = buildWing(sides.left, false);
  const right = buildWing(sides.right, true);
  return { left: left.group, right: right.group, shards: { left: left.shards, right: right.shards } };
}
