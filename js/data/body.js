// Body parts, in reference-image pixels (body axis at x = 341).

// Hourglass thorax: shoulders where the wings attach, tapering into the abdomen.
export const thorax = [
  [341, 296], [349, 300], [356, 312], [360, 330], [357, 348], [350, 360],
  [344, 368], [341, 371], [338, 368], [332, 360], [325, 348], [322, 330],
  [326, 312], [333, 300],
];
// Thin paper-white sheen down the thorax (the "small white gaps").
export const thoraxHighlight = { a: [339, 308], b: [337, 352], w: 3.5 };
// Short fur strokes around the thorax: every `every`-th outline point, `length` px outward.
export const fur = { every: 4, length: 6, skipBelow: 360 };

export const head = { center: [341, 290], r: 8 };

// Antenna stalks and club tips (club drawn as a lens: round at `a`, tapering into the stalk at `b`).
export const antennae = [
  { path: [[337, 283], [330, 262], [314, 232], [299, 208], [292, 196]], club: { a: [286, 167], b: [293, 199], w: 10 } },
  { path: [[345, 283], [352, 262], [368, 232], [383, 208], [390, 196]], club: { a: [396, 167], b: [389, 199], w: 10 } },
];

// Faceted crystal abdomen.
export const abdomen = [
  [341, 366], [354, 378], [357, 405], [352, 445], [341, 470], [330, 445], [325, 405], [328, 378],
];
export const abdomenFacets = [
  [[341, 366], [341, 470]],
  [[328, 378], [341, 390], [354, 378]],
  [[325, 405], [341, 414], [357, 405]],
  [[330, 445], [341, 414], [352, 445]],
];
export const abdomenShade = [[341, 390], [341, 470], [330, 445], [325, 405], [328, 378]];

// Jointed legs (left side; mirrored for the right).
export const legs = [
  [[331, 344], [312, 351], [296, 365]],
  [[332, 355], [316, 369], [306, 389]],
  [[335, 363], [324, 383], [320, 404]],
];
