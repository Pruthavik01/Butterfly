// Subtle motion: wing "breathing", drifting fragments, mouse parallax.
export function createAnimator({ wings, fragments, guides }) {
  const mouse = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };

  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  return {
    update(t) {
      // Wings open/close slightly around the body axis.
      const flap = 1 - 0.045 * (0.5 + 0.5 * Math.sin(t * 1.6));
      wings.left.scale.x = wings.right.scale.x = flap;

      for (const f of fragments.children) {
        const { base, phase, rot } = f.userData;
        f.position.x = base.x + Math.sin(t * 0.6 + phase) * 2.5;
        f.position.y = base.y + Math.cos(t * 0.5 + phase * 1.3) * 2.5;
        f.rotation.z = rot + Math.sin(t * 0.4 + phase) * 0.06;
      }

      eased.x += (mouse.x - eased.x) * 0.05;
      eased.y += (mouse.y - eased.y) * 0.05;
      fragments.position.set(eased.x * 10, eased.y * 10, 0);
      guides.position.set(eased.x * 3, eased.y * 3, 0);
    },
  };
}
