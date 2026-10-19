import * as THREE from 'three';
import { ink, lines } from '../core/materials.js';
import { Z, toWorld, toWorldAll } from '../utils/coords.js';
import { arcPoints, makeFill, makeLine, makeDot } from '../utils/draw.js';
import {
  axisTop, axisDot, arrow, axisBottomSolid, axisBottomDashed, diamond, axisBottomDotted, arc,
} from '../data/guides.js';

export function createGuides() {
  const group = new THREE.Group();

  // Vertical axis above the head, with arrow and dot.
  group.add(makeLine(toWorldAll(axisTop), lines.thin, { z: Z.guides }));
  group.add(makeFill(toWorldAll(arrow), ink, Z.guides));
  const [dx, dy] = toWorld(axisDot);
  group.add(makeDot(dx, dy, axisDot[2], ink, Z.guides));

  // Axis continuing below the abdomen.
  group.add(makeLine(toWorldAll(axisBottomSolid), lines.thin, { z: Z.guides }));
  group.add(makeLine(toWorldAll(axisBottomDashed), lines.dashed, { z: Z.guides }));
  group.add(makeFill(toWorldAll(diamond), ink, Z.guides));
  group.add(makeLine(toWorldAll(axisBottomDotted), lines.dotted, { z: Z.guides }));

  // Incomplete dashed construction circle.
  const [cx, cy] = toWorld(arc.center);
  group.add(makeLine(arcPoints(cx, cy, arc.r, arc.from, arc.to), lines.dashed, { z: Z.guides }));

  return group;
}
