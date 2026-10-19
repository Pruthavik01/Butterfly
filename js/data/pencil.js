// Faint graphite construction lines under the ink, in reference-image pixels.

export const circle = { center: [348, 515], r: 112 };
export const headGuide = { center: [341, 290], r: 22 };

export const strokes = [
  [[341, 12], [341, 700]],   // full vertical axis
  [[24, 336], [676, 336]],   // horizontal through the thorax
  [[341, 330], [55, 196]],   // upper wing reach
  [[341, 330], [627, 196]],
  [[341, 350], [96, 440]],   // lower wing reach
  [[341, 350], [586, 440]],
];

// Measurement ticks along the axis.
export const ticks = { x: 341, from: 100, to: 660, step: 20, size: 4 };
