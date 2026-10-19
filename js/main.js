import * as THREE from 'three';
import { createStage } from './core/scene.js';
import { createComposer } from './core/post.js';
import { createPaper } from './components/paper.js';
import { createPencil } from './components/pencil.js';
import { createGuides } from './components/guides.js';
import { createUpperWings } from './components/upperWings.js';
import { createLowerWings } from './components/lowerWings.js';
import { createBody } from './components/body.js';
import { createFragments } from './components/fragments.js';
import { createReferenceOverlay } from './components/reference.js';
import { createAnimator } from './animation/animate.js';
import { createIntro } from './animation/intro.js';
import { createShatter } from './animation/shatter.js';
import { createMetamorphosis } from './animation/metamorphosis.js';

const container = document.getElementById('app');
const { renderer, scene, camera } = createStage(container);
const composer = createComposer(renderer, scene, camera, container);

scene.add(createPaper());

const pencil = createPencil();
scene.add(pencil);

const guides = createGuides();
scene.add(guides);

// Each side's upper + lower wing share a group pivoting on the body axis.
const upper = createUpperWings();
const lower = createLowerWings();
const wings = { left: new THREE.Group(), right: new THREE.Group() };
wings.left.add(lower.left, upper.left);
wings.right.add(lower.right, upper.right);
scene.add(wings.left, wings.right);

const body = createBody();
scene.add(body);

const fragments = createFragments();
scene.add(fragments);

const overlay = createReferenceOverlay();
scene.add(overlay);

const animator = createAnimator({ wings, fragments, guides });
const intro = createIntro({ pencil: [pencil], ink: [guides, wings.left, wings.right, body, fragments] });
const shatter = createShatter({ camera, canvas: renderer.domElement, shards: lower.shards });
const metamorphosis = createMetamorphosis(upper.morphs);

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') overlay.visible = !overlay.visible;
  if (e.code === 'Space') intro.replay();
});

let last = 0;
renderer.setAnimationLoop((ms) => {
  const t = ms / 1000;
  const dt = Math.min(t - last, 0.1);
  last = t;
  intro.update(t);
  animator.update(t);
  shatter.update(t, dt);
  metamorphosis.update(t);
  composer.render();
});
