/* eslint-env node */
/** Verify species isolation and cancellation when same-named atlases load asynchronously. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function runtime(fetchManifest) {
  const requests = [];
  class Image {
    get src() {
      return this.url;
    }

    set src(url) {
      this.url = url;
      requests.push(url);
      Promise.resolve().then(() => this.onload());
    }
  }
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/components/pet-panel/pet-assets.ts'),
    'utf8',
  );
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = {
    exports: {},
    process: { env: { VUE_APP_PUBLIC_PATH: '/pet/' } },
    fetch: fetchManifest,
    Image,
    window: { setTimeout, clearTimeout },
  };
  vm.runInNewContext(output, context);
  return { assets: context.exports, requests };
}

const manifests = Object.fromEntries(
  ['dog', 'chicken'].map(species => [
    species,
    JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          `../public/assets/pets/${species === 'dog' ? 'v2' : 'chicken-v2'}/manifest.json`,
        ),
        'utf8',
      ),
    ),
  ]),
);
const response = manifest => ({ ok: true, json: async () => manifest });

async function main() {
  const fetched = [];
  const { assets, requests } = runtime(async url => {
    fetched.push(url);
    return response(manifests[url.includes('chicken-v2') ? 'chicken' : 'dog']);
  });
  const [dog, chicken] = await Promise.all([
    assets.loadPetManifest('dog'),
    assets.loadPetManifest('chicken'),
  ]);
  assert.notEqual(dog.version, chicken.version);
  assert.equal(await assets.loadPetManifest('chicken'), chicken);
  assert.equal(fetched.length, 2, 'each species shares only its own manifest');
  assert.equal(assets.petPoster('egg', 'chicken'), '/pet/assets/pets/chicken-v2/egg-poster.webp');
  assert.equal(assets.hasPetAtlas('chicken'), true);
  assert.equal(assets.hasPetAtlas('toString'), false);

  await assets.preparePetStage('juvenile', 'chicken');
  const file = `${chicken.stages.juvenile.file}?v=${chicken.version}`;
  const wrongSpecies = await assets.loadPetImage(file, 'dog');
  assert.ok(wrongSpecies.url.includes('/v2/'), 'dog cannot consume a same-named chicken preload');
  const prepared = await assets.loadPetImage(file, 'chicken');
  assert.ok(prepared.url.includes('/chicken-v2/'));
  assert.equal(requests.length, 2, 'the correct species reuses its prepared image');

  let release;
  const late = runtime(
    () =>
      new Promise(resolve => {
        release = resolve;
      }),
  );
  const preparation = late.assets.preparePetStage('adult', 'chicken');
  late.assets.clearPreparedPetImage();
  release(response(manifests.chicken));
  await preparation;
  assert.equal(
    late.requests.length,
    0,
    'clearing a pending preload prevents its late image request',
  );

  let attempts = 0;
  const retry = runtime(async () =>
    ++attempts === 1 ? { ok: false, status: 503 } : response(manifests.chicken),
  );
  await assert.rejects(retry.assets.loadPetManifest('chicken'), /503/);
  assert.equal(await retry.assets.loadPetManifest('chicken'), manifests.chicken);
  console.log(
    'Pet asset checks passed: species manifests, posters, preload isolation, cancellation and retry.',
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
