// Deterministic noise in [-1, 1] keyed on a point, so a vertex shared by
// several polygons is always displaced the same way (facets stay connected).
export function hash2(x, y, seed = 0) {
  const h = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return (h - Math.floor(h)) * 2 - 1;
}

// Subdivide each edge and bow it slightly, so straight strokes look pen-drawn.
// Endpoints stay fixed and the offset is keyed on position along a canonical
// normal, so an edge shared by two facets wobbles identically in both.
export function wobble(points, amount, closed = false, step = 14) {
  const out = [];
  const edges = closed ? points.length : points.length - 1;
  for (let i = 0; i < edges; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const flip = x2 < x1 || (x2 === x1 && y2 < y1) ? -1 : 1;
    const nx = (-(y2 - y1) / len) * flip, ny = ((x2 - x1) / len) * flip;
    const k = Math.max(1, Math.round(len / step));
    const sign = hash2(Math.round(x1 + x2), Math.round(y1 + y2), 3);
    for (let j = 0; j < k; j++) {
      const t = j / k;
      const o = Math.sin(Math.PI * t) * sign * amount;
      out.push([x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o]);
    }
  }
  if (!closed) out.push(points[points.length - 1]);
  return out;
}

// Irregular inked edge for dense smooth outlines (offset along the normal by smoothed noise).
export function roughen(points, amount, seed = 0) {
  const n = points.length;
  let noise = points.map((_, i) => hash2(i, 0, seed));
  for (let pass = 0; pass < 3; pass++) {
    noise = noise.map((v, i) => (noise[(i - 1 + n) % n] + v + noise[(i + 1) % n]) / 3);
  }
  return points.map(([x, y], i) => {
    const [px, py] = points[(i - 1 + n) % n];
    const [qx, qy] = points[(i + 1) % n];
    const len = Math.hypot(qx - px, qy - py) || 1;
    const o = noise[i] * amount * 2; // smoothing shrinks the range, compensate
    return [x - ((qy - py) / len) * o, y + ((qx - px) / len) * o];
  });
}

// Hand-drawn wobble: small, stable offsets per vertex.
export function jitter(points, amount, seed = 0) {
  return points.map(([x, y]) => [
    x + hash2(x, y, seed) * amount,
    y + hash2(y, x, seed + 1) * amount,
  ]);
}
