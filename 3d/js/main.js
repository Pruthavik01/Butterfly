import * as THREE from 'three';
import { createStage } from './core/stage.js';
import { createComposer } from './core/post.js';
import { createUpperWings3d } from './components/upperWings3d.js';
import { createLowerWings3d } from './components/lowerWings3d.js';
import { createBody3d } from './components/body3d.js';
import { createFragments3d } from './components/fragments3d.js';
import { createGuides3d } from './components/guides3d.js';
import { createFlight } from './animation/flight.js';
import { createShatter3d } from './animation/shatter3d.js';
import { createDrift } from './animation/drift.js';

const container = document.getElementById('app');
const { renderer, scene, camera, controls } = createStage(container);
const composer = createComposer(renderer, scene, camera, container);

// The 2D artwork lives in local XY (body axis = y). Tilting it back makes it
// lie almost flat, head away from the camera, wings facing up.
const TILT = -Math.PI / 2 + 0.3;

// flier: hover/roll/pitch -> root: fixed tilt -> wings, body, guides.
const flier = new THREE.Group();
const root = new THREE.Group();
root.rotation.x = TILT;
flier.add(root);
scene.add(flier);

// Each side's upper + lower wing share a hinge on the body axis (x = 0).
const upper = createUpperWings3d();
const lower = createLowerWings3d();
const wings = { left: new THREE.Group(), right: new THREE.Group() };
wings.left.add(upper.left, lower.left);
wings.right.add(upper.right, lower.right);
root.add(wings.left, wings.right, createBody3d());

const guides = createGuides3d();
root.add(guides.group);

// Fragments float in the same plane but don't follow the hover.
const field = new THREE.Group();
field.rotation.x = TILT;
const fragments = createFragments3d();
field.add(fragments);
scene.add(field);

const flight = createFlight({ flier, wings });
const shatter = createShatter3d({ camera, canvas: renderer.domElement, shards: lower.shards });
const drift = createDrift({ fragments, ring: guides.ring, gem: guides.gem });

let last = 0;
renderer.setAnimationLoop((ms) => {
  const t = ms / 1000;
  const dt = Math.min(t - last, 0.1);
  last = t;
  flight.update(t);
  shatter.update(t, dt);
  drift.update(t);
  controls.update();
  composer.render();
});
