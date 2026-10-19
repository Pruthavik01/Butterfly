import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export const INK_COLOR = 0x161616;
export const PAPER_COLOR = 0xefede8;
export const PENCIL_COLOR = 0xb8b3a8;

// Shared "ink flood" reveal: fragments of inked fills farther than uInkRadius
// from uInkOrigin are discarded, with a ragged noisy front (used by the intro).
export const inkReveal = {
  uInkRadius: { value: 1e4 },
  uInkOrigin: { value: new THREE.Vector2(0, 0) },
};

function withInkReveal(material) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, inkReveal);
    shader.vertexShader = 'varying vec2 vInkWorld;\n' + shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\n  vInkWorld = (modelMatrix * vec4(transformed, 1.0)).xy;'
    );
    shader.fragmentShader = `varying vec2 vInkWorld;
uniform float uInkRadius;
uniform vec2 uInkOrigin;
float inkHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float inkNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(inkHash(i), inkHash(i + vec2(1, 0)), f.x),
             mix(inkHash(i + vec2(0, 1)), inkHash(i + vec2(1, 1)), f.x), f.y);
}
` + shader.fragmentShader.replace('void main() {', `void main() {
  float inkD = length(vInkWorld - uInkOrigin)
    + (inkNoise(vInkWorld * 0.04) - 0.5) * 70.0
    + (inkNoise(vInkWorld * 0.3) - 0.5) * 8.0;
  if (inkD > uInkRadius) discard;`);
  };
  return material;
}

export const ink = withInkReveal(new THREE.MeshBasicMaterial({ color: INK_COLOR, side: THREE.DoubleSide }));
// Paper-coloured shapes painted over ink (wing markings) appear with the ink.
export const inkPaper = withInkReveal(new THREE.MeshBasicMaterial({ color: PAPER_COLOR, side: THREE.DoubleSide }));
export const paper = new THREE.MeshBasicMaterial({ color: PAPER_COLOR, side: THREE.DoubleSide });

// Fat-line materials; widths are in CSS px at the reference image's scale
// and get rescaled with the viewport in updateLineMaterials().
const lineMaterials = [];

function lineMaterial(width, options = {}) {
  const m = new LineMaterial({ color: INK_COLOR, linewidth: width, ...options });
  m.userData.baseWidth = width;
  lineMaterials.push(m);
  return m;
}

export const lines = {
  thick: lineMaterial(2.6),
  medium: lineMaterial(1.7),
  thin: lineMaterial(1.1),
  hatch: lineMaterial(0.8),
  dashed: lineMaterial(1.3, { dashed: true, dashSize: 6, gapSize: 5 }),
  dotted: lineMaterial(1.5, { dashed: true, dashSize: 2, gapSize: 5 }),
  pencil: lineMaterial(0.8, { color: PENCIL_COLOR }),
};

export function updateLineMaterials(width, height, scale) {
  for (const m of lineMaterials) {
    m.resolution.set(width, height);
    m.linewidth = m.userData.baseWidth * scale;
  }
}
