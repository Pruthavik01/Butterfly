import { inkReveal } from '../core/materials.js';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (v) => 1 - (1 - v) ** 3;

const FLOOD_START = 3.2;
const FLOOD_DURATION = 2.8;
const FLOOD_RADIUS = 500;

// Draw-on intro: pencil strokes sketch themselves, then ink outlines, then the
// black areas flood outward from the body.
export function createIntro({ pencil, ink }) {
  const strokes = [];

  function collect(roots, start, spread, duration) {
    const found = [];
    for (const root of roots) root.traverse((o) => { if (o.isLineSegments2) found.push(o); });
    found.forEach((o, i) => strokes.push({
      geometry: o.geometry,
      total: o.geometry.attributes.instanceStart.count,
      start: start + (spread * i) / found.length,
      duration,
    }));
  }
  collect(pencil, 0, 1.2, 0.9);
  collect(ink, 1.0, 2.6, 0.9);

  const end = FLOOD_START + FLOOD_DURATION;
  let t0 = null;
  let done = false;

  return {
    update(t) {
      if (done) return;
      if (t0 === null) t0 = t;
      const e = t - t0;

      for (const s of strokes) {
        s.geometry.instanceCount = Math.ceil(clamp01((e - s.start) / s.duration) * s.total);
      }
      inkReveal.uInkRadius.value = easeOut(clamp01((e - FLOOD_START) / FLOOD_DURATION)) * FLOOD_RADIUS;

      if (e > end) {
        inkReveal.uInkRadius.value = 1e4;
        done = true;
      }
    },
    replay() {
      t0 = null;
      done = false;
    },
  };
}
