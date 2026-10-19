// Slow loop: the organic upper wings turn angular/faceted, hold, then return.
const START = 8;      // let the intro finish first
const ORGANIC = 8;    // seconds held organic
const CHANGE = 2.5;   // seconds per transition
const GEOMETRIC = 4;  // seconds held geometric
const CYCLE = ORGANIC + CHANGE + GEOMETRIC + CHANGE;

export function createMetamorphosis(morphs) {
  return {
    update(t) {
      const c = (t - START) % CYCLE;
      let m;
      if (t < START || c < ORGANIC) m = 0;
      else if (c < ORGANIC + CHANGE) m = (c - ORGANIC) / CHANGE;
      else if (c < ORGANIC + CHANGE + GEOMETRIC) m = 1;
      else m = 1 - (c - ORGANIC - CHANGE - GEOMETRIC) / CHANGE;
      m = m * m * (3 - 2 * m);

      for (const mesh of morphs) mesh.morphTargetInfluences[0] = m;
    },
  };
}
