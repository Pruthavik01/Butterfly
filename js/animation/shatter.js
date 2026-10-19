import * as THREE from 'three';

const HOLD = 2.5; // seconds a wing stays broken after the pointer last touched it

// Hover (or tap) a lower wing: its facets break away and drift outward,
// then slowly settle back into place.
export function createShatter({ camera, canvas, shards }) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pointerInside = false;

  const wings = Object.values(shards).map((list) => ({
    list,
    fills: list.map((s) => s.userData.fill),
    amount: 0,
    holdUntil: 0,
  }));

  const onPointer = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerInside = true;
  };
  canvas.addEventListener('pointermove', onPointer);
  canvas.addEventListener('pointerdown', onPointer);
  canvas.addEventListener('pointerleave', () => { pointerInside = false; });

  return {
    update(t, dt) {
      if (pointerInside) raycaster.setFromCamera(ndc, camera);

      for (const wing of wings) {
        if (pointerInside && raycaster.intersectObjects(wing.fills, false).length) {
          wing.holdUntil = t + HOLD;
        }
        const target = t < wing.holdUntil ? 1 : 0;
        wing.amount += (target - wing.amount) * (1 - Math.exp(-dt * (target ? 4 : 1.2)));
        const e = wing.amount * wing.amount * (3 - 2 * wing.amount);

        for (const s of wing.list) {
          const { base, dir, dist, spin, phase } = s.userData;
          s.position.x = base.x + dir.x * dist * e + Math.sin(t * 0.9 + phase) * 3 * e;
          s.position.y = base.y + dir.y * dist * e + Math.cos(t * 0.7 + phase) * 3 * e;
          s.rotation.z = spin * e;
        }
      }
    },
  };
}
