import { wingFlex } from '../core/materials.js';

// Wing-beat on a real hinge plus a gentle hover of the whole butterfly.
const BEAT = 3.2;     // rad/s (~0.5 beats per second)
const FLEX = 11;      // tip bend (world units) per rad/s of wing speed
const RESPONSE = 10;  // how quickly the membrane follows (higher = stiffer)

const flapAngle = (t) => {
  const p = t * BEAT;
  // Skewed sine: quick down-stroke, slower recovery.
  return 0.25 + 0.45 * Math.sin(p + 0.5 * Math.sin(p));
};

export function createFlight({ flier, wings }) {
  let last = null;

  return {
    update(t) {
      const angle = flapAngle(t);
      wings.left.rotation.y = angle;   // left tip lifts toward +z (up)
      wings.right.rotation.y = -angle;

      // Tips lag the stroke: bend opposite to the wing's angular velocity.
      const dt = last === null ? 0 : Math.min(t - last, 0.1);
      last = t;
      const omega = (flapAngle(t + 0.01) - angle) / 0.01;
      const bend = wingFlex.uBend.value;
      wingFlex.uBend.value = bend + (-FLEX * omega - bend) * (1 - Math.exp(-dt * RESPONSE));
      wingFlex.uTwist.value = wingFlex.uBend.value * 0.5;
      wingFlex.uTime.value = t;

      const stroke = (angle - 0.25) / 0.45;
      flier.position.y = 12 * Math.sin(t * 1.1) - 6 * stroke; // body dips on the down-stroke
      flier.rotation.z = 0.06 * Math.sin(t * 0.6);           // slow roll
      flier.rotation.x = 0.04 * Math.sin(t * 0.8 + 1);       // slow pitch
    },
  };
}
