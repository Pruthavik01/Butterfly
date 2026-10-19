import * as THREE from 'three';
import { obsidian, glass, edgeLine, dashedLine, dottedLine } from '../core/materials.js';
import { rod, withEdges, dashed, centroid } from '../utils/geometry3d.js';
import { toWorld, toWorldAll } from '../../../js/utils/coords.js';
import { arcPoints } from '../../../js/utils/draw.js';
import {
  axisTop, axisDot, arrow, axisBottomSolid, axisBottomDashed, diamond, axisBottomDotted, arc,
} from '../../../js/data/guides.js';

const at = ([x, y]) => [x, y, 0];

export function createGuides3d() {
  const group = new THREE.Group();

  // Axis above the head: thin obsidian rod, pyramid arrowhead, bead on top.
  const [top, bottom] = toWorldAll(axisTop);
  group.add(rod(at(top), at(bottom), 0.7, obsidian));
  const [ax, ay] = centroid(toWorldAll(arrow));
  const head = new THREE.Mesh(new THREE.ConeGeometry(7, 28, 4), obsidian);
  head.position.set(ax, ay, 0);
  head.castShadow = true;
  group.add(head);
  const [dx, dy] = toWorld(axisDot);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(axisDot[2] * 1.3, 16, 12), obsidian);
  bead.position.set(dx, dy, 0);
  group.add(bead);

  // Axis below the abdomen: rod, dashes, glass diamond, dots.
  const [s0, s1] = toWorldAll(axisBottomSolid);
  group.add(rod(at(s0), at(s1), 0.7, obsidian));
  group.add(dashed(toWorldAll(axisBottomDashed), dashedLine));
  group.add(dashed(toWorldAll(axisBottomDotted), dottedLine));
  const [gx, gy] = centroid(toWorldAll(diamond));
  const gem = withEdges(new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), glass), edgeLine);
  gem.scale.set(6, 14, 6);
  gem.position.set(gx, gy, 0);
  group.add(gem);

  // Dashed construction ring, pivoting on its own centre so it can gyrate.
  const [cx, cy] = toWorld(arc.center);
  const ring = new THREE.Group();
  ring.position.set(cx, cy, 0);
  ring.add(dashed(arcPoints(0, 0, arc.r, arc.from, arc.to), dashedLine));
  group.add(ring);

  return { group, ring, gem };
}
