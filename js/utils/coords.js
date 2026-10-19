// All data is authored in the reference image's pixel space (714 x 714, y down).
// World space: origin on the butterfly's body axis, y up.
export const IMAGE_SIZE = 714;
export const CX = 341; // body axis x in the image
export const CY = 357; // image vertical centre

// Draw order along z (orthographic camera looks down -z).
export const Z = {
  paper: -1,
  pencil: 0.5,
  guides: 1,
  lower: 2,
  upper: 3,
  markings: 4,
  body: 5,
  fragments: 6,
  overlay: 9,
};

export const toWorld = ([x, y]) => [x - CX, CY - y];
export const toWorldAll = (pts) => pts.map(toWorld);
export const mirrorX = (pts) => pts.map(([x, y]) => [-x, y]);
