import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { wobble, hash2 } from './random.js';

// ---------- point generators ----------

export function smooth(points, closed = false, segments = 120) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    closed,
    'centripetal'
  );
  return curve.getPoints(segments).map((v) => [v.x, v.y]);
}

export function ellipsePoints(cx, cy, rx, ry, rotation = 0, n = 32) {
  const c = Math.cos(rotation), s = Math.sin(rotation);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}

export function arcPoints(cx, cy, r, fromDeg, toDeg, n = 96) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = THREE.MathUtils.degToRad(fromDeg + ((toDeg - fromDeg) * i) / n);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// Curved wing cell from a to b. The a-end is a blunt round cap; with
// `peak` < 0.5 the b-end is a long taper (teardrop), otherwise it is round too (pill/oval).
export function lens(a, b, width, bend = 0, peak = 0.5, n = 32) {
  const [ax, ay] = a, [bx, by] = b;
  const len = Math.hypot(bx - ax, by - ay);
  const nx = -(by - ay) / len, ny = (bx - ax) / len; // left normal
  const mx = (ax + bx) / 2 + nx * bend, my = (ay + by) / 2 + ny * bend;
  const top = [], bottom = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // quadratic bezier a -> m -> b
    const x = (1 - t) ** 2 * ax + 2 * (1 - t) * t * mx + t * t * bx;
    const y = (1 - t) ** 2 * ay + 2 * (1 - t) * t * my + t * t * by;
    const u = t < peak ? t / peak : (1 - t) / (1 - peak);
    const roundCap = t < peak || peak >= 0.5;
    const w = ((roundCap ? Math.sqrt(1 - (1 - u) ** 2) : Math.sin((Math.PI / 2) * u)) * width) / 2;
    top.push([x + nx * w, y + ny * w]);
    bottom.push([x - nx * w, y - ny * w]);
  }
  return [...top, ...bottom.reverse().slice(1, -1)];
}

// Parallel strokes clipped to a polygon (pen hatching).
export function hatch(poly, angleDeg, spacing) {
  const a = THREE.MathUtils.degToRad(angleDeg);
  const c = Math.cos(a), s = Math.sin(a);
  const rot = poly.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
  const back = (x, y) => [x * c - y * s, x * s + y * c];
  const ys = rot.map((p) => p[1]);
  const max = Math.max(...ys);
  const segs = [];
  for (let y = Math.min(...ys) + spacing / 2; y < max; y += spacing) {
    const xs = [];
    for (let i = 0; i < rot.length; i++) {
      const [x1, y1] = rot[i], [x2, y2] = rot[(i + 1) % rot.length];
      if ((y1 <= y) !== (y2 <= y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) segs.push([back(xs[i], y), back(xs[i + 1], y)]);
  }
  return segs;
}

// Angular version of a dense closed outline with the SAME point count:
// pick `keys` corners and place every other point on the straight edges
// between them. Used as the morph target for the organic -> geometric loop.
export function facetize(points, keys) {
  const n = points.length;
  const idx = Array.from({ length: keys }, (_, k) =>
    Math.round(((k + 0.3 * hash2(k, keys, 9)) * n) / keys + n) % n
  ).sort((a, b) => a - b);
  const out = new Array(n);
  for (let k = 0; k < keys; k++) {
    const i0 = idx[k], i1 = idx[(k + 1) % keys];
    const span = (i1 - i0 + n) % n || n;
    const [x0, y0] = points[i0], [x1, y1] = points[i1];
    for (let j = 0; j < span; j++) {
      const t = j / span;
      out[(i0 + j) % n] = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
  }
  return out;
}

// ---------- object builders ----------

export function makeFill(points, material, z = 0) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.position.z = z;
  return mesh;
}

// Fill whose outline can morph from pointsA to pointsB (same length) via
// morphTargetInfluences[0]. ShapeGeometry may reorder vertices, so each vertex
// is matched back to its source point by position.
export function makeMorphFill(pointsA, pointsB, material, z = 0) {
  const mesh = makeFill(pointsA, material, z);
  const pos = mesh.geometry.attributes.position;
  const key = (x, y) => `${Math.fround(x)},${Math.fround(y)}`;
  const lookup = new Map(pointsA.map(([x, y], i) => [key(x, y), i]));
  const target = new Float32Array(pos.count * 3);
  for (let v = 0; v < pos.count; v++) {
    const i = lookup.get(key(pos.getX(v), pos.getY(v)));
    const [x, y] = i === undefined ? [pos.getX(v), pos.getY(v)] : pointsB[i];
    target.set([x, y, 0], v * 3);
  }
  mesh.geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(target, 3)];
  mesh.updateMorphTargets();
  return mesh;
}

// `rough` > 0 gives the stroke a slight pen wobble between its vertices.
export function makeLine(points, material, { closed = false, z = 0, rough = 0 } = {}) {
  const base = rough ? wobble(points, rough, closed) : points;
  const pts = closed ? [...base, base[0]] : base;
  const geometry = new LineGeometry();
  geometry.setPositions(pts.flatMap(([x, y]) => [x, y, 0]));
  const line = new Line2(geometry, material);
  line.computeLineDistances();
  line.position.z = z;
  return line;
}

export function makeSegments(segments, material, z = 0) {
  const geometry = new LineSegmentsGeometry();
  geometry.setPositions(segments.flatMap(([[x1, y1], [x2, y2]]) => [x1, y1, 0, x2, y2, 0]));
  const lines = new LineSegments2(geometry, material);
  lines.position.z = z;
  return lines;
}

export function makeDot(x, y, r, material, z = 0) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 20), material);
  mesh.position.set(x, y, z);
  return mesh;
}
