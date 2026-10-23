/* eslint-env node */
/** Exercise cancellation, display-stage ordering and obstacle-safe movement without a browser. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(name) {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/components/pet-panel', `${name}.ts`), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, Set, Math, Promise };
  vm.runInNewContext(output, context, { filename: name });
  return context.exports;
}

async function checkIndependentPetStore() {
  const { createPinia, PiniaVuePlugin } = require('pinia');
  require('vue').use(PiniaVuePlugin);
  const dog = { id: 1, species: 'dog', name: '小萌', exp: 100, satiety: 72, stage: 'adult' };
  const chicken = { id: 2, species: 'chicken', name: '宠物蛋', exp: 0, satiety: 40, stage: 'egg' };
  let finishOldState;
  let requestedPetId;
  const api = {
    state: () => new Promise(resolve => { finishOldState = resolve; }),
    switchSpecies: async () => ({ pet: chicken }),
    feed: async (_action, _food, petId) => {
      requestedPetId = petId;
      return { balance: '90.00', pet: { ...chicken, exp: 10 } };
    },
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../src/components/pet-panel/use-pet-store.ts'), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, window: { setTimeout: () => 0 },
    require: name => name === 'pinia' ? require('pinia') : { petApi: api, ApiError: class extends Error {} } };
  vm.runInNewContext(output, context, { filename: 'use-pet-store' });
  const store = context.exports.usePetStore(createPinia());
  store.authenticated = true;
  store.pet = dog;
  store.balance = '100.00';
  const reading = store.refreshState();
  assert.equal(await store.switchSpecies('chicken'), true);
  finishOldState({ user: { username: 'viewer' }, points: { balance: '100.00' }, pet: dog });
  await reading;
  assert.equal(store.pet.id, chicken.id, 'late old state cannot restore the previous pet');
  assert.equal(store.pet.exp, 0, 'first switch uses the new pet progress');
  await store.feed({ code: 'normal_feed' });
  assert.equal(requestedPetId, chicken.id, 'feeding identifies the selected individual pet');
  assert.equal(store.pet.exp, 10);
  api.feed = async () => ({ balance: '80.00', pet: dog });
  assert.equal(await store.feed({ code: 'normal_feed' }), null);
  assert.equal(store.pet.id, chicken.id, 'a replay for another pet cannot replace the selected pet');
  assert.equal(store.balance, '90.00');
}

async function main() {
  const { PetDirector, sampleClip } = load('pet-animation');
  const { withFeedingTiming, feedingBowlStyle } = load('pet-feeding');
  const motion = load('pet-motion');
  const clip = { loop: false, frames: [{ rect: [0, 0, 1, 1], duration: 100 }, { rect: [1, 0, 1, 1], duration: 300 }] };
  assert.equal(sampleClip(clip, 100).frame.rect[0], 1);
  assert.equal(sampleClip(clip, 399).done, false);
  assert.equal(sampleClip(clip, 400).done, true);
  assert.equal(sampleClip({ ...clip, loop: true }, 450).frame.rect[0], 0);

  const feedingClip = withFeedingTiming(clip);
  const feedingDuration = feedingClip.frames.reduce((total, frame) => total + frame.duration, 0);
  assert.equal(feedingDuration, 760, 'bowl transitions extend the clip instead of cutting off chewing');
  assert.equal(clip.frames[0].duration, 100, 'shared atlas timings remain unchanged');
  assert.equal(sampleClip(feedingClip, 179).frame.rect[0], 0, 'hold the first pose while placing the bowl');
  assert.equal(sampleClip(feedingClip, 759).done, false);
  assert.equal(sampleClip(feedingClip, 760).done, true, 'completion includes clearing the bowl');
  assert.equal(feedingBowlStyle('dog', 'egg', 0, feedingDuration).opacity, 0);
  assert.equal(feedingBowlStyle('dog', 'egg', 180, feedingDuration).opacity, 1);
  assert.equal(feedingBowlStyle('dog', 'egg', feedingDuration - 90, feedingDuration).opacity, 0.5);
  assert.equal(feedingBowlStyle('dog', 'egg', feedingDuration + 500, feedingDuration).opacity, 0, 'a slow growth preload cannot leave a stale bowl');
  assert.equal(feedingBowlStyle('dog', 'egg', 0, feedingDuration, true).opacity, 1, 'reduced motion uses a still bowl');
  for (const species of ['dog']) {
    for (const stage of ['egg', 'juvenile', 'adult']) {
      const placement = feedingBowlStyle(species, stage, 180, feedingDuration);
      const center = parseFloat(placement.left);
      const halfWidth = parseFloat(placement.width) / 2;
      assert.ok(center - halfWidth >= 0 && center + halfWidth <= 100, 'bowl stays inside the pet viewport at every scale');
    }
  }

  const dogEat = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/assets/pets/v2/manifest.json'), 'utf8')).actions.eat;
  const dogFeeding = withFeedingTiming(dogEat, 'dog');
  const dogDuration = dogFeeding.frames.reduce((total, frame) => total + frame.duration, 0);
  const bowlTiming = dogFeeding.bowlTiming;
  assert.equal(dogDuration, dogEat.frames.reduce((total, frame) => total + frame.duration, 0) + 360);
  assert.equal(sampleClip(dogFeeding, bowlTiming.leaveStart).frame.rect[0], dogEat.frames[4].rect[0], 'stay low while removing the bowl');
  assert.equal(sampleClip(dogFeeding, bowlTiming.leaveEnd).frame.rect[0], dogEat.frames[6].rect[0], 'raise the head only after removing the bowl');
  assert.equal(feedingBowlStyle('dog', 'adult', bowlTiming.leaveEnd, dogDuration, false, bowlTiming).opacity, 0);
  assert.equal(withFeedingTiming(dogEat, 'chicken').bowlTiming, undefined, 'other species retain their own feeding sequence');
  assert.equal(withFeedingTiming(dogEat, 'chicken'), dogEat, 'non-dog clips are returned unchanged');
  assert.equal(Object.keys(feedingBowlStyle('chicken', 'juvenile', 850, dogDuration)).length, 0, 'dog bowl placement does not apply to another species');

  // Measured front paw edges must remain behind the bowl in both standing and lowered poses.
  const pawEdges = { egg: [166, 145], juvenile: [180, 153], adult: [193, 155] };
  for (const [stage, edges] of Object.entries(pawEdges)) {
    for (const [index, elapsed] of [180, bowlTiming.arriveEnd].entries()) {
      const placement = feedingBowlStyle('dog', stage, elapsed, dogDuration, false, bowlTiming);
      const width = parseFloat(placement.width) * 256 / 100;
      const bowlLeft = parseFloat(placement.left) * 256 / 100 - width * 35 / 80;
      assert.ok(bowlLeft - edges[index] >= 4, `${stage} front paw must stay clear of the bowl`);
    }
  }

  // Measured tongue tips from both licking poses must land inside the SVG's food ellipse.
  const lickingTips = {
    egg: [[161.6, 210], [157.3, 210]],
    juvenile: [[169.2, 209], [173.6, 208]],
    adult: [[180.8, 207], [184.3, 206]],
  };
  for (const [stage, tips] of Object.entries(lickingTips)) {
    const placement = feedingBowlStyle('dog', stage, 850, dogDuration, false, bowlTiming);
    const width = parseFloat(placement.width) * 256 / 100;
    const foodX = parseFloat(placement.left) * 256 / 100;
    const foodY = 224 - parseFloat(placement.bottom) * 224 / 100 - width * 27 / 80;
    for (const [x, y] of tips) {
      const distance = ((x - foodX) / (width * 29 / 80)) ** 2 + ((y - foodY) / (width * 7.5 / 80)) ** 2;
      assert.ok(distance <= 1, `${stage} tongue must touch food instead of the floor`);
    }
  }

  const director = new PetDirector('egg', () => {});
  const result = { actionId: 'growth-1', pet: { stage: 'juvenile' }, evolved: true };
  const sequence = director.beginFeed();
  const completion = director.finishFeed(result, sequence);
  assert.equal(director.scene.action, 'eat');
  assert.equal(director.scene.stage, 'egg', 'old dog eats before switching stage');
  director.complete(director.scene.token - 1);
  assert.equal(director.scene.action, 'eat', 'stale player completion is ignored');
  director.complete(director.scene.token);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(director.scene.action, 'grow-out');
  assert.equal(director.scene.stage, 'egg');
  director.complete(director.scene.token);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(director.scene.action, 'grow-in');
  assert.equal(director.scene.stage, 'juvenile');
  director.complete(director.scene.token);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(director.scene.action, 'happy');
  director.complete(director.scene.token);
  assert.equal(await completion, true);
  assert.equal(director.scene.busy, false);

  let releasePreparation;
  const preparation = new Promise(resolve => { releasePreparation = resolve; });
  const preparing = director.beginFeed();
  const preparedFeed = director.finishFeed({ ...result, actionId: 'prepare-next', pet: { stage: 'adult' } }, preparing, preparation);
  director.complete(director.scene.token);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(director.scene.action, 'eat', 'keep old stage while next atlas prepares');
  releasePreparation();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(director.scene.action, 'grow-out');
  director.interrupt();
  assert.equal(await preparedFeed, false);
  assert.equal(director.scene.action, 'idle');

  const interrupted = director.beginFeed();
  const interruptedCompletion = director.finishFeed({ ...result, actionId: 'growth-2', pet: { stage: 'adult' } }, interrupted);
  director.interrupt('dragged');
  assert.equal(await interruptedCompletion, false);
  assert.equal(director.scene.stage, 'adult', 'cancelled animation still converges to server stage');
  assert.equal(director.scene.action, 'dragged');
  const pending = director.beginFeed();
  director.interrupt('dragged');
  assert.equal(await director.finishFeed({ ...result, actionId: 'late-response', pet: { stage: 'adult' } }, pending), false);
  assert.equal(director.scene.action, 'dragged', 'late HTTP response cannot restart a cancelled action');
  assert.equal(await director.finishFeed({ ...result, actionId: 'duplicate', idempotent: true }, director.beginFeed()), false);
  assert.equal(director.scene.busy, false);

  const viewport = { width: 500, height: 500, petWidth: 100, petHeight: 100 };
  const obstacle = [{ left: 200, top: 200, right: 300, bottom: 400 }];
  const manualDrop = motion.clampPetPosition({ x: 220, y: 250 }, viewport);
  assert.equal(manualDrop.x, 220);
  assert.equal(manualDrop.y, 250, 'manual placement may overlap the player instead of snapping to the bottom');
  const outside = motion.clampPetPosition({ x: -100, y: 900 }, viewport);
  assert.equal(outside.x, 8);
  assert.equal(outside.y, 392, 'keep the complete pet inside the viewport');
  const resized = motion.clampPetPosition({ x: 390, y: 390 }, { ...viewport, width: 300, height: 300 });
  assert.equal(resized.x, 192);
  assert.equal(resized.y, 192, 'viewport changes clamp to the nearest edge without resetting the position');
  const dock = motion.findSafeDock(viewport, obstacle);
  assert.ok(dock && motion.isSafePoint(dock, viewport, obstacle));
  assert.equal(motion.findSafeDock(viewport, [{ left: 0, top: 0, right: 500, bottom: 500 }]), null);
  const watchViewport = { width: 1280, height: 720, petWidth: 136, petHeight: 119 };
  const watchRegions = [
    { left: 0, top: 0, right: 960, bottom: 900 },
    { left: 972, top: 0, right: 1280, bottom: 900 },
  ];
  const input = { left: 972, top: 640, right: 1280, bottom: 720 };
  const bottomRight = { x: 1120, y: 577 };
  assert.equal(motion.findSafeDock(watchViewport, watchRegions, bottomRight), null,
    'a watch page taller than the viewport has no blank docking area before scrolling');
  const visible = motion.findPetDock(watchViewport, [...watchRegions, input], [input], bottomRight);
  assert.ok(motion.isSafePoint(visible, watchViewport, [input]),
    'show the pet without scrolling while keeping it away from the chat input');
  const recalled = motion.findPetDock(watchViewport, watchRegions, [input]);
  assert.ok(motion.isSafePoint(recalled, watchViewport, [input]),
    'recall chooses a visible position even when all video/chat regions are occupied');
  const covered = [{ left: 0, top: 0, right: 1280, bottom: 720 }];
  const fallback = motion.findPetDock(watchViewport, covered, covered, { x: 1400, y: 900 });
  assert.ok(fallback.x >= 8 && fallback.x + watchViewport.petWidth <= watchViewport.width - 8);
  assert.ok(fallback.y >= 8 && fallback.y + watchViewport.petHeight <= watchViewport.height - 8,
    'a completely occupied layout must not make recall a dead end');
  const spare = motion.findPetDock(viewport, obstacle, [], { x: 8, y: 8 });
  assert.equal(spare.x, 8);
  assert.equal(spare.y, 8, 'keep the preferred position when blank space is available');
  const target = motion.safeWalkTarget({ x: 20, y: 250 }, 300, viewport, obstacle);
  assert.ok(target + viewport.petWidth < obstacle[0].left, 'walk cannot cross an obstacle');
  assert.equal(motion.lookDirection(0, -100, null), 0);
  assert.equal(motion.lookDirection(100, 0, null), 4);
  assert.equal(motion.lookDirection(0, 100, null), 8);
  assert.equal(motion.lookDirection(-100, 0, null), 12);
  assert.equal(motion.lookDirection(0, 0, null), null);
  assert.equal(motion.lookDirection(0, -500, null), null);
  await checkIndependentPetStore();
  console.log('Pet runtime checks passed: timing, growth order, cancellation, idempotency, obstacles, gaze, independent pet state and stale responses.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
