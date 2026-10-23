import type { PetAtlasManifest, PetStage } from './pet-animation';

const publicBase = process.env.VUE_APP_PUBLIC_PATH || '/';
const atlasDirectories: Record<string, string> = { dog: 'v2', chicken: 'chicken-v2' };

export function hasPetAtlas(species = 'dog'): boolean {
  return Object.prototype.hasOwnProperty.call(atlasDirectories, species);
}

export function petAssetBase(species = 'dog'): string {
  return `${publicBase.replace(/\/?$/, '/')}assets/pets/${atlasDirectories[species]}/`;
}

const manifestRequests = new Map<string, Promise<PetAtlasManifest>>();
let preparedImage: { file: string; request: Promise<HTMLImageElement> } | null = null;
let preparationVersion = 0;

/** 清单按物种共享，避免同名阶段和文件让小鸡与小狗串用图集。 */
export function loadPetManifest(species = 'dog'): Promise<PetAtlasManifest> {
  let request = manifestRequests.get(species);
  if (!request) {
    request = fetch(`${petAssetBase(species)}manifest.json`, { cache: 'no-cache' })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`Pet manifest: ${response.status}`);
        }
        const data = (await response.json()) as PetAtlasManifest;
        if (data.schema !== 'polyv-pet/2' || !data.actions?.idle?.frames.length) {
          throw new Error('Unsupported pet atlas');
        }
        return data;
      })
      .catch(error => {
        manifestRequests.delete(species);
        throw error;
      });
    manifestRequests.set(species, request);
  }
  return request;
}

export function petPoster(stage: PetStage, species = 'dog'): string {
  return `${petAssetBase(species)}${stage}-poster.webp`;
}

export function loadPetImage(file: string, species = 'dog'): Promise<HTMLImageElement> {
  const url = `${petAssetBase(species)}${file}`;
  if (preparedImage?.file === url) {
    const request = preparedImage.request;
    preparedImage = null;
    return request;
  }
  return fetchPetImage(url);
}

/** 进食期间并行准备成长图集，最多缓存一张；慢网下有界等待后仍可用封面。 */
export function preparePetStage(stage: PetStage, species = 'dog'): Promise<void> {
  const version = ++preparationVersion;
  const preparation = loadPetManifest(species).then(data => {
    // 切换宠物或卸载后，迟到的预加载不能重新占用缓存。
    if (version !== preparationVersion) return;
    const file = `${petAssetBase(species)}${data.stages[stage].file}?v=${data.version}`;
    const request = fetchPetImage(file);
    preparedImage = { file, request };
    return request;
  });
  return new Promise(resolve => {
    const timeout = window.setTimeout(resolve, 2500);
    const finish = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    preparation.then(finish, finish);
  });
}

export function clearPreparedPetImage() {
  preparationVersion += 1;
  preparedImage = null;
}

function fetchPetImage(file: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = window.setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      reject(new Error('Pet image timed out'));
    }, 10000);
    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('Pet image unavailable'));
    };
    img.src = file;
  });
}
