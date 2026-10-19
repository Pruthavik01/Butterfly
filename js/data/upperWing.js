// Upper wings, traced separately from the reference (they are not exact mirrors).
// All coordinates are reference-image pixels.
//
// silhouette: control points smoothed into a closed curve; the root spans the
//             thorax side (y 316-352) so the wing fuses into the body.
// markings:   white cells as lenses from `a` (outer, rounded end) to `b`
//             (tapered end, toward the body). `w` = max width, `peak` = where the
//             cell is widest (small = blunt outer end), `bend` = curvature.
// dots:       round white spots in the black border, [x, y, r].

export const wings = {
  left: {
    silhouette: [
      [340, 316], [313, 293], [263, 263], [217, 233], [170, 207], [140, 185],
      [113, 179], [80, 181], [52, 192], [44, 217], [48, 260], [58, 300],
      [76, 334], [97, 363], [130, 380], [163, 384], [213, 378], [263, 364],
      [313, 350], [340, 352],
    ],
    markings: [
      // large discal cells converging on the body
      { a: [118, 345], b: [318, 326], w: 42, peak: 0.3, bend: -3 },
      { a: [180, 262], b: [327, 313], w: 40, peak: 0.3, bend: 2 },
      // medium cells
      { a: [108, 300], b: [217, 302], w: 25, peak: 0.35 },
      { a: [103, 268], b: [177, 272], w: 20, peak: 0.35 },
      { a: [160, 218], b: [198, 241], w: 16, peak: 0.4 },
      { a: [133, 240], b: [177, 248], w: 14, peak: 0.4 },
      // submarginal dashes in the black border
      { a: [73, 228], b: [105, 227], w: 14 },
      { a: [77, 252], b: [100, 252], w: 11 },
      { a: [83, 197], b: [120, 198], w: 10 },
      { a: [132, 207], b: [147, 207], w: 8 },
      { a: [84, 284], b: [93, 279], w: 8 },
    ],
    dots: [
      [63, 201, 3.5], [60, 230, 4], [120, 230, 4], [65, 260, 3.5], [65, 288, 3.5],
      [88, 307, 3], [75, 317, 3], [83, 332, 3], [100, 333, 3], [97, 352, 3.5],
      [115, 362, 3.5], [132, 370, 3.5], [150, 372, 3],
    ],
  },

  right: {
    silhouette: [
      [342, 316], [363, 300], [430, 243], [490, 207], [530, 182], [563, 173],
      [613, 173], [647, 183], [658, 210], [655, 250], [643, 283], [630, 317],
      [610, 350], [580, 370], [547, 380], [497, 383], [457, 370], [413, 350],
      [380, 337], [342, 352],
    ],
    markings: [
      // large discal cells converging on the body
      { a: [542, 338], b: [383, 323], w: 38, peak: 0.3, bend: 3 },
      { a: [490, 249], b: [362, 312], w: 40, peak: 0.3, bend: -2 },
      // medium cells
      { a: [563, 298], b: [453, 302], w: 26, peak: 0.35 },
      { a: [580, 257], b: [497, 263], w: 24, peak: 0.35 },
      { a: [560, 225], b: [500, 228], w: 19, peak: 0.35 },
      { a: [543, 200], b: [493, 210], w: 18, peak: 0.4 },
      // submarginal dashes in the black border
      { a: [563, 192], b: [580, 193], w: 13 },
      { a: [597, 185], b: [617, 187], w: 11 },
      { a: [597, 210], b: [623, 212], w: 13 },
      { a: [598, 234], b: [625, 238], w: 12 },
    ],
    dots: [
      [575, 218, 5], [640, 200, 3.5], [640, 218, 3.5], [640, 247, 3.5], [605, 257, 4],
      [627, 268, 2.5], [593, 278, 4.5], [618, 287, 3.5], [577, 307, 6], [607, 313, 3.5],
      [563, 332, 5], [592, 338, 3.5], [552, 350, 4.5], [575, 360, 4], [538, 368, 5],
      [510, 367, 2.5],
    ],
  },
};
