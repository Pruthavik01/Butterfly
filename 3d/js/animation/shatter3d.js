import * as THREE from 'three';

const HOLD = 2.5; // seconds the wings stay broken after the pointer last touched a shard

// Hover (or tap) the crystal lower wings: shards burst outward and tumble,
// then settle back into place.
export function createShatter3d({ camera, canvas, shards }) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const q = new THREE.Quaternion();
  let pointerInside = false;
  let holdUntil = 0;
  let amount = 0;

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
      if (pointerInside) {
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.intersectObjects(shards, false).length) holdUntil = t + HOLD;
      }
      const target = t < holdUntil ? 1 : 0;
      amount += (target - amount) * (1 - Math.exp(-dt * (target ? 4 : 1.2)));
      const e = amount * amount * (3 - 2 * amount);

      for (const s of shards) {
        const { base, dir, dist, axis, spin, phase } = s.userData;
        s.position.copy(base).addScaledVector(dir, dist * e);
        s.position.z += Math.sin(t * 0.9 + phase) * 4 * e;
        s.quaternion.copy(q.setFromAxisAngle(axis, spin * e));
      }
    },
  };
}
