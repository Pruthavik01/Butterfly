// Floating fragments bob and tumble slowly; the construction ring gyrates.
export function createDrift({ fragments, ring, gem }) {
  return {
    update(t) {
      for (const f of fragments.children) {
        const { base, rot, phase } = f.userData;
        f.position.set(
          base.x + Math.sin(t * 0.5 + phase) * 4,
          base.y + Math.cos(t * 0.4 + phase * 1.3) * 4,
          base.z + Math.sin(t * 0.7 + phase) * 6
        );
        f.rotation.set(rot.x + t * 0.15, rot.y + t * 0.2 + phase, rot.z);
      }
      ring.rotation.y = t * 0.25;
      ring.rotation.x = 0.4 * Math.sin(t * 0.3);
      gem.rotation.y = t * 0.8;
    },
  };
}
