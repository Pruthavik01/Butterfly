import * as THREE from 'three';
import { glass, frostedGlass, edgeLine, dashedLine } from '../core/materials.js';
import { centroid, crystal, withEdges, dashed } from '../utils/geometry3d.js';
import { toWorldAll, mirrorX } from '../../../js/utils/coords.js';
import { jitter, hash2 } from '../../../js/utils/random.js';
import { facets, sides } from '../../../js/data/lowerWing.js';

const DEPTH = -12; // sit just under the upper wings so crystals don't poke through

// Every facet of the 2D lower wing becomes its own glass crystal shard.
function buildWing(cfg, mirrored) {
  const toSide = (pts) => {
    const w = toWorldAll(pts);
    return jitter(mirrored ? mirrorX(w) : w, cfg.jitter, cfg.seed);
  };
  const group = new THREE.Group();
  group.position.z = DEPTH;
  const shards = [];

  facets.forEach((facet, fi) => {
    const pts = toSide(facet);
    const [cx, cy] = centroid(pts);
    const local = pts.map(([x, y]) => [x - cx, y - cy]);
    const height = 5 + 2.5 * (hash2(fi, cfg.seed) + 1);
    const frosted = cfg.hatch.some((h) => h.facet === fi);

    const shard = withEdges(new THREE.Mesh(crystal(local, height, height * 0.4), frosted ? frostedGlass : glass), edgeLine);
    shard.position.set(cx, cy, 0);

    const len = Math.hypot(cx, cy) || 1;
    shard.userData = {
      base: shard.position.clone(),
      dir: new THREE.Vector3(cx / len, cy / len, 0.6 + 0.4 * hash2(cfg.seed, fi)).normalize(),
      dist: 50 + 25 * (hash2(fi, cfg.seed + 3) + 1),
      axis: new THREE.Vector3(hash2(fi, 1), hash2(fi, 2), hash2(fi, 3)).normalize(),
      spin: 1 + 0.6 * hash2(fi, cfg.seed + 5),
      phase: hash2(fi, fi + cfg.seed) * Math.PI,
    };
    group.add(shard);
    shards.push(shard);
  });

  group.add(dashed(toSide(cfg.dashed), dashedLine));
  return { group, shards };
}

export function createLowerWings3d() {
  const left = buildWing(sides.left, false);
  const right = buildWing(sides.right, true);
  return { left: left.group, right: right.group, shards: [...left.shards, ...right.shards] };
}
