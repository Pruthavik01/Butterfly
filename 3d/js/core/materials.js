import * as THREE from 'three';

// Glossy black stone for everything that was solid ink.
export const obsidian = new THREE.MeshPhysicalMaterial({
  color: 0x0a0a0c,
  roughness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
});

// Faceted crystal for the geometric parts. A faint icy tint (attenuation) and
// iridescence keep it readable against both light and dark backgrounds.
export const glass = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 1,
  roughness: 0.04,
  ior: 1.52,
  thickness: 12,
  attenuationColor: new THREE.Color(0x9fd8ff),
  attenuationDistance: 40,
  flatShading: true,
  iridescence: 0.6,
  iridescenceIOR: 1.3,
});

// Hatched facets in the drawing become frosted glass.
export const frostedGlass = glass.clone();
frostedGlass.roughness = 0.45;

// The white wing cells: milky, slightly warm glass windows in the obsidian.
export const milkyGlass = new THREE.MeshPhysicalMaterial({
  color: 0xf3eee4,
  transmission: 0.85,
  roughness: 0.3,
  ior: 1.45,
  thickness: 2,
  emissive: 0xf3eee4,
  emissiveIntensity: 0.12, // slight glow so the pattern stays crisp against the black
  side: THREE.DoubleSide,
});

// Wing flex: the upper wings bend in the vertex shader. Bend grows with the
// square of the distance from the body (tips lag, roots stay put), plus a slight
// chordwise twist and a small travelling ripple. Normals are bent to match so the
// reflections move with the surface. Uniforms are driven by animation/flight.js.
export const wingFlex = {
  uBend: { value: 0 },
  uTwist: { value: 0 },
  uTime: { value: 0 },
};

const FLEX_GLSL = /* glsl */ `
uniform float uBend;
uniform float uTwist;
uniform float uTime;
float flexZ(vec3 p) {
  float u = clamp(abs(p.x) / 330.0, 0.0, 1.0);
  float span = u * u;
  float ripple = sin(uTime * 7.0 - abs(p.x) * 0.025) * 1.2 * u;
  return uBend * span + uTwist * span * (p.y / 120.0) + ripple;
}
`;

function withWingFlex(material) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, wingFlex);
    shader.vertexShader = FLEX_GLSL + shader.vertexShader
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
  {
    float dzdx = (flexZ(position + vec3(1, 0, 0)) - flexZ(position - vec3(1, 0, 0))) * 0.5;
    float dzdy = (flexZ(position + vec3(0, 1, 0)) - flexZ(position - vec3(0, 1, 0))) * 0.5;
    objectNormal = normalize(objectNormal + vec3(-dzdx, -dzdy, 0.0) * objectNormal.z);
  }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
  transformed.z += flexZ(position);`);
  };
  material.customProgramCacheKey = () => 'wingFlex';
  return material;
}

export const wingObsidian = withWingFlex(obsidian.clone());
export const wingGlass = withWingFlex(milkyGlass.clone());
// Shadow pass uses its own material; flex it too so the shadow bends with the wing.
export const wingDepth = withWingFlex(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }));

// Light edges on crystals: the drawing's lines, readable on the slate backdrop.
export const edgeLine = new THREE.LineBasicMaterial({ color: 0xe8e6e1, transparent: true, opacity: 0.6 });

// Construction marks (dashed arc, dashed axis, wing guides).
export const dashedLine = new THREE.LineDashedMaterial({ color: 0xd8d4cc, dashSize: 6, gapSize: 5 });
export const dottedLine = new THREE.LineDashedMaterial({ color: 0xd8d4cc, dashSize: 2, gapSize: 5 });
