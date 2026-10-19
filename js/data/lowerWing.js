// LEFT lower (geometric) wing, in reference-image pixels.
// The right wing mirrors these facets but gets its own jitter seed, hatching
// and dashed guide, so the two sides are similar but not identical.
// The facets tile the wing; edges used by only one facet form its outline.

export const facets = [
  [[300, 370], [330, 358], [330, 392], [310, 410]],
  [[230, 380], [300, 370], [310, 410], [260, 420], [225, 405]],
  [[170, 385], [230, 380], [225, 405], [185, 425], [155, 410]],
  [[130, 390], [170, 385], [155, 410], [140, 440], [110, 420]],
  [[110, 420], [140, 440], [125, 470], [95, 440]],
  [[155, 410], [185, 425], [190, 460], [165, 470], [140, 440]],
  [[185, 425], [225, 405], [260, 420], [265, 455], [230, 470], [190, 460]],
  [[260, 420], [310, 410], [330, 392], [320, 430], [300, 470], [265, 455]],
  [[140, 440], [165, 470], [165, 500], [140, 480], [125, 470]],
  [[165, 470], [190, 460], [230, 470], [235, 520], [200, 520], [165, 500]],
  [[230, 470], [265, 455], [300, 470], [270, 505], [235, 520]],
];

export const sides = {
  left: {
    seed: 1,
    jitter: 2.5,
    hatch: [{ facet: 3, angle: 60, spacing: 4 }, { facet: 9, angle: 35, spacing: 4.5 }],
    dashed: [[258, 392], [165, 462]],
  },
  right: {
    seed: 7,
    jitter: 4,
    hatch: [{ facet: 4, angle: -55, spacing: 4 }, { facet: 10, angle: -30, spacing: 4.5 }],
    dashed: [[242, 385], [224, 505]],
  },
};
