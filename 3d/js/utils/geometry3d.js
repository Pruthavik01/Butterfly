import * as THREE from 'three';

export const centroid = (pts) => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];

export const shapeFrom = (pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
export const pathFrom = (pts) => new THREE.Path(pts.map(([x, y]) => new THREE.Vector2(x, y)));

export function circlePath(x, y, r) {
  const path = new THREE.Path();
  path.absarc(x, y, r, 0, Math.PI * 2, false);
  return path;
}

// Flat 2D shape extruded into a thin bevelled slab, centred on z = 0.
export function slab(shape, depth, bevel) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

// Closed bipyramid over a (star-shaped) polygon: apex `up` above and `down`
// below its centroid. Non-indexed, so normals come out flat per facet.
export function crystal(points, up, down) {
  const area = points.reduce((s, [x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length];
    return s + x1 * y2 - x2 * y1;
  }, 0);
  const ring = area > 0 ? points : [...points].reverse(); // counter-clockwise
  const [cx, cy] = centroid(ring);
  const pos = [];
  ring.forEach(([x1, y1], i) => {
    const [x2, y2] = ring[(i + 1) % ring.length];
    pos.push(x1, y1, 0, x2, y2, 0, cx, cy, up);
    pos.push(x2, y2, 0, x1, y1, 0, cx, cy, -down);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.computeVertexNormals();
  return geometry;
}

// Lathe around the y axis from [radius, y] pairs (bottom to top).
export const lathe = (profile, segments) =>
  new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);

// Cylinder between two 3D points.
export function rod(a, b, radius, material) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, va.distanceTo(vb), 8), material);
  mesh.position.copy(va).add(vb).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return mesh;
}

export function withEdges(mesh, material) {
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 1), material));
  return mesh;
}

export function dashed(points, material) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z))),
    material
  );
  line.computeLineDistances();
  return line;
}
