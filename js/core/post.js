import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Full-screen pass that makes the clean render read as ink on paper:
// slightly bled/wobbly edges, uneven ink density with dry speckles,
// paper fibres and a soft vignette.
const InkPaperShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uPixelRatio;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
                 mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
      return v;
    }

    void main() {
      vec2 texel = 1.0 / uResolution;
      vec2 px = vUv * uResolution / uPixelRatio; // CSS pixels, so grain size is DPR-independent

      // Ink bleed: wobble the sampling position, then soften with a tiny blur.
      vec2 warp = (vec2(fbm(px * 0.07), fbm(px * 0.07 + 31.7)) - 0.5) * 1.6 * uPixelRatio * texel;
      vec2 uv = vUv + warp;
      vec2 o = texel * uPixelRatio * 0.7;
      vec3 col = texture2D(tDiffuse, uv).rgb * 0.4
        + texture2D(tDiffuse, uv + vec2(o.x, 0.0)).rgb * 0.15
        + texture2D(tDiffuse, uv - vec2(o.x, 0.0)).rgb * 0.15
        + texture2D(tDiffuse, uv + vec2(0.0, o.y)).rgb * 0.15
        + texture2D(tDiffuse, uv - vec2(0.0, o.y)).rgb * 0.15;

      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float ink = 1.0 - smoothstep(0.05, 0.75, lum); // 1 on ink, 0 on paper

      // Uneven ink density and small dry-brush speckles.
      col += ink * (fbm(px * 0.35) - 0.5) * 0.05;
      float speck = smoothstep(0.78, 0.86, fbm(px * 1.3 + 7.0));
      col = mix(col, vec3(0.86, 0.84, 0.80), ink * speck * 0.25);

      // Paper fibres (stretched noise) and soft vignette.
      float fibre = fbm(vec2(px.x * 0.6, px.y * 0.05)) * 0.6 + fbm(px * 0.15) * 0.4;
      col *= 0.96 + 0.06 * fibre;
      col *= 1.0 - 0.12 * smoothstep(0.35, 0.85, length(vUv - 0.5));

      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function createComposer(renderer, scene, camera, container) {
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const inkPass = new ShaderPass(InkPaperShader);
  composer.addPass(inkPass);
  composer.addPass(new OutputPass());

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    const dpr = renderer.getPixelRatio();
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    inkPass.uniforms.uResolution.value.set(w * dpr, h * dpr);
    inkPass.uniforms.uPixelRatio.value = dpr;
  }

  window.addEventListener('resize', resize);
  resize();
  return composer;
}
