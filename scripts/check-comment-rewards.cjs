/* eslint-env node */
/** 验收奖励队列在网络重试、刷新、身份切换及喂养并发时的行为。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { createPinia, PiniaVuePlugin } = require('pinia');
require('vue').use(PiniaVuePlugin);

function load(file, dependencies, storage) {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/components/pet-panel', file + '.ts'),
    'utf8',
  );
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = {
    exports: {},
    localStorage: storage,
    window: { setTimeout: () => 0 },
    require: name => (name === 'pinia' ? require('pinia') : dependencies[name]),
  };
  vm.runInNewContext(output, context, { filename: file });
  return context.exports;
}

async function main() {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const calls = [];
  const toasts = [];
  const summary = {
    enabled: true,
    configurationReady: true,
    rewardPoints: '2.00',
    dailyLimit: '50.00',
    dailyEarned: '0.00',
    cooldownSeconds: 60,
    nextRewardAt: new Date().toISOString(),
    serverTime: new Date().toISOString(),
    status: null,
    eventId: null,
    rewardedPoints: '0.00',
  };
  const receipt = messageId => ({ messageId, content: '发评论测试', messageTime: Date.now() });
  const api = {
    submitComment: async message => {
      calls.push(message);
      return { ...summary, eventId: 1, status: 'rewarded', rewardedPoints: '2.00' };
    },
    commentRewards: async () => summary,
  };
  const pet = { showToast: message => toasts.push(message), refreshAfterReward: async () => {} };
  const { useCommentRewardStore } = load(
    'use-comment-rewards',
    { './pet-api': { petApi: api }, './use-pet-store': { usePetStore: () => pet } },
    storage,
  );
  const store = useCommentRewardStore(createPinia());
  store.setIdentity('viewer-a');
  store.queue(receipt('server-id'));
  store.queue(receipt('server-id'));
  await store.tick();
  assert.equal(calls.length, 1, 'duplicate SDK events submit one receipt');
  assert.equal(calls[0].content, '发评论测试', 'receipt carries the SPEAK text');
  assert.equal(store.pending.length, 0, 'synchronous reward needs no polling');
  assert.equal(toasts.length, 1, 'reward is shown immediately after the response');

  api.submitComment = async () => {
    throw new Error('offline');
  };
  store.queue(receipt('offline-id'));
  await store.tick();
  assert.ok(store.retryAt > Date.now(), 'network errors back off');
  const restored = useCommentRewardStore(createPinia());
  restored.setIdentity('viewer-a');
  assert.equal(restored.pending[0].messageId, 'offline-id');
  assert.equal(restored.pending[0].content, '发评论测试', 'reload retains the complete receipt');
  api.submitComment = async () => ({
    ...summary,
    status: 'rewarded',
    rewardedPoints: '2.00',
    replayed: true,
  });
  await restored.tick();
  assert.equal(restored.pending.length, 0);
  assert.equal(toasts.length, 1, 'repeated receipt does not replay the reward toast');

  let finish;
  api.submitComment = () =>
    new Promise(resolve => {
      finish = resolve;
    });
  restored.queue(receipt('late-id'));
  const old = restored.tick();
  restored.setIdentity('viewer-b');
  finish({ ...summary, status: 'rewarded', rewardedPoints: '2.00' });
  await old;
  assert.equal(restored.summary, null, 'late response cannot overwrite another identity');
  assert.equal(toasts.length, 1);

  let finishFeed;
  const livePet = { id: 1, species: 'dog', name: '小萌' };
  const petApi = {
    feed: () =>
      new Promise(resolve => {
        finishFeed = resolve;
      }),
    state: async () => ({
      user: { username: 'viewer' },
      points: { balance: '92.00' },
      pet: livePet,
    }),
  };
  const { usePetStore } = load(
    'use-pet-store',
    { './pet-api': { petApi, ApiError: class extends Error {} } },
    storage,
  );
  const petStore = usePetStore(createPinia());
  petStore.authenticated = true;
  petStore.pet = livePet;
  const feeding = petStore.feed({ code: 'food' });
  await petStore.refreshAfterReward();
  assert.equal(petStore.balanceDirty, true);
  finishFeed({ balance: '90.00', pet: livePet });
  await feeding;
  assert.equal(
    petStore.balance,
    '92.00',
    'reward received during feeding triggers a final authoritative balance read',
  );
  const callbacks = {};
  const queued = [];
  const { bindChatModuleEvents } = load(
    '../../core/bind-sdk-events/bind-chat-events',
    {
      '@/assets/lang': { translate: value => value },
      '@/hooks/core/use-error-verify': { useErrorVerify: () => ({ redirectToErrorVerify() {} }) },
      '@/store/use-chat-store': { useChatStore: () => ({}) },
      '@/store/use-watch-app-store': { useWatchAppStore: () => ({}) },
      '@polyv/live-watch-sdk': {
        ChatEvents: new Proxy({}, { get: (_, key) => key }),
        ChatMsgSource: { Speak: 'speak' },
      },
      '@/components/pet-panel/use-pet-store': {
        usePetStore: () => ({ authenticated: true, identity: { viewerId: 'viewer-a' } }),
      },
      '@/components/pet-panel/use-comment-rewards': {
        useCommentRewardStore: () => ({
          queue: receipt => queued.push(receipt),
          tick: async () => {},
        }),
      },
    },
    storage,
  );
  bindChatModuleEvents({
    chat: {
      eventEmitter: {
        on: (name, callback) => {
          callbacks[name] = callback;
        },
      },
    },
  });
  const confirmed = {
    id: 'confirmed-id',
    content: '发评论测试',
    user: { userId: 'viewer-a' },
    msgSource: 'speak',
    isSended: true,
    time: Date.now(),
  };
  callbacks.SelfSpeak({ chatMsg: { ...confirmed, isSended: false } });
  callbacks.ReplaceChatMessage({ chatMsg: { ...confirmed, isSendFailed: true } });
  callbacks.ChatMessage({ chatMsg: confirmed, isChatReplayMsg: true });
  callbacks.ReplaceChatMessage({ chatMsg: { ...confirmed, user: { userId: 'someone-else' } } });
  callbacks.SelfSpeak({ chatMsg: confirmed, isOnlyLocalMsg: true });
  assert.equal(
    queued.length,
    0,
    'local echoes, failed sends, replays and other viewers cannot submit reward claims',
  );
  callbacks.ReplaceChatMessage({ chatMsg: confirmed });
  assert.equal(
    queued[0].messageId,
    'confirmed-id',
    'server acknowledgment reaches the shared reward queue',
  );
  callbacks.ChatMessage({ chatMsg: { ...confirmed, id: 'speak-broadcast', isSended: undefined } });
  assert.equal(
    queued[1].messageId,
    'speak-broadcast',
    'received SPEAK does not require an optional send flag',
  );
  assert.equal(queued[1].content, '发评论测试');
  console.log(
    'Comment reward runtime checks passed: deduplication, reload recovery, retry backoff, receipt replay, identity isolation and concurrent feeding.',
  );
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
