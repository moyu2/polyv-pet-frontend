/* eslint-env node */
/** Verify viewport limits, foot anchoring and feeding-panel placement without mounting the SDK. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.resolve(__dirname, '../src/components/pet-panel/pet-motion.ts'), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(output, context);
const { getPetSize, normalizePetScale, resizePetPosition, placePetBubble } = context.exports;
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} != ${expected}`);

assert.equal(normalizePetScale(NaN), 1);
assert.equal(normalizePetScale(Infinity), 1);
assert.equal(normalizePetScale(0), 1);
assert.equal(normalizePetScale(99), 2.5);
const desktop = getPetSize(1360, 900, 2);
assert.equal(desktop.petWidth, 272);
assert.equal(desktop.petHeight, 238);
assert.equal(getPetSize(390, 844, 2.5).petWidth, 260);
const constrained = getPetSize(1360, 200, 2.5);
assert.ok(constrained.scale < 2.5);
assert.ok(constrained.petHeight <= 184);
assert.equal(getPetSize(1360, 900, 2.5).scale, 2.5, 'restoring the viewport restores the requested size');

const previous = { width: 1360, height: 900, petWidth: 136, petHeight: 119 };
const next = { ...previous, ...desktop };
const start = { x: 400, y: 400 };
const anchored = resizePetPosition(start, previous, next);
near(start.x + previous.petWidth / 2, anchored.x + next.petWidth / 2);
near(start.y + previous.petHeight * 212 / 224, anchored.y + next.petHeight * 212 / 224);
const edge = resizePetPosition({ x: 1200, y: 760 }, previous, next);
assert.ok(edge.x >= 8 && edge.x + next.petWidth <= next.width - 8);
assert.ok(edge.y >= 8 && edge.y + next.petHeight <= next.height - 8);

const above = placePetBubble({ x: 600, y: 600 }, next, 252, 420);
assert.equal(above.y, 172);
const below = placePetBubble({ x: 100, y: 100 }, next, 252, 420);
assert.equal(below.y, 346);
const side = placePetBubble({ x: 400, y: 300 }, { ...next, petWidth: 340, petHeight: 297.5 }, 252, 420);
assert.equal(side.x, 748);
for (const point of [{ x: 8, y: 8 }, { x: 122, y: 364 }, { x: 40, y: 200 }]) {
  const position = placePetBubble(point, { width: 390, height: 600, petWidth: 260, petHeight: 227.5 }, 252, 440);
  assert.ok(position.x >= 12 && position.x + 252 <= 378);
  assert.ok(position.y >= 12 && position.y + 440 <= 588);
}
// Transparent sprite margins must not intercept player clicks; preserve padding at image edges.
const hitSource = fs.readFileSync(path.resolve(__dirname, '../src/components/pet-panel/pet-hit-area.ts'), 'utf8');
const hitContext = { exports: {} };
vm.runInNewContext(ts.transpileModule(hitSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, hitContext);
const { alphaHitArea } = hitContext.exports;
const pixels = new Uint8ClampedArray(100 * 100 * 4);
for (let y = 30; y < 60; y++) {
  for (let x = 20; x < 50; x++) pixels[(y * 100 + x) * 4 + 3] = 255;
}
pixels[3] = 11;
let area = alphaHitArea(pixels, 100, 100);
near(area.x, 0.14); near(area.y, 0.24);
near(area.width, 0.42); near(area.height, 0.42);
pixels[3] = 255;
area = alphaHitArea(pixels, 100, 100);
assert.equal(area.x, 0); assert.equal(area.y, 0);
const empty = alphaHitArea(new Uint8ClampedArray(16), 2, 2);
assert.equal(empty.width, 1); assert.equal(empty.height, 1);
console.log('Pet size checks passed: viewport limits, foot anchor, panel placement and transparent hit area.');
