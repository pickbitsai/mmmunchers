import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');

const root = fileURLToPath(new URL('../', import.meta.url));
// Exercise the real TS store/bridge together, isolated per test, without a server.
const bundle = await build({
  stdin: { contents: `export * from './client/src/lib/pickbits';
    export * from './client/src/lib/careerStats';
    export * from './client/src/lib/stores/useCareerState';
    export * from './client/src/lib/stores/useGameState';`, resolveDir: root },
  bundle: true, write: false, format: 'iife', globalName: 'gameTest',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const plain = value => JSON.parse(JSON.stringify(value));
const settle = () => new Promise(resolve => setImmediate(resolve));
function harness({ url = 'http://mmmunchers.pickbits.ai/?pb=1', sdk, stored = {}, blocked = false } = {}) {
  const storage = new Map(Object.entries(stored));
  const scripts = [], events = [], timers = [], handlers = new Map();
  const window = {
    location: new URL(url), innerWidth: 1200, PickBits: sdk,
    addEventListener: (name, cb) => handlers.set(name, [...(handlers.get(name) || []), cb]),
    removeEventListener: (name, cb) => handlers.set(name, (handlers.get(name) || []).filter(h => h !== cb)),
    dispatchEvent: event => { events.push(event.type); for (const cb of handlers.get(event.type) || []) cb(event); },
  };
  const context = vm.createContext({
    window, URLSearchParams, console, CustomEvent: class { constructor(type) { this.type = type; } },
    setTimeout: cb => timers.push(cb), clearTimeout() {},
    document: { createElement: () => ({}), head: { appendChild: script => scripts.push(script) } },
    localStorage: {
      getItem: key => { if (blocked) throw Error('storage blocked'); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (blocked) throw Error('storage blocked'); storage.set(key, value); },
    },
  });
  vm.runInContext(bundle.outputFiles[0].text, context);
  return { api: context.gameTest, storage, scripts, events, timers, window };
}

function mockSdk({ currentUser = null, load = async () => null } = {}) {
  const calls = { init: [], saves: [], scores: [], unlocks: [], loads: 0, logins: 0 };
  let callback;
  return {
    calls,
    sdk: {
      init: opts => calls.init.push(plain(opts)),
      getUser: () => currentUser,
      onAuthChange: cb => { callback = cb; },
      promptLogin: () => calls.logins++,
      loadProgress: () => { calls.loads++; return load(); },
      saveProgress: async (data, opts) => calls.saves.push({ data: plain(data), opts: plain(opts) }),
      submitScore: async score => calls.scores.push(score),
      unlockAchievement: async slug => calls.unlocks.push(slug),
    },
    auth: user => { currentUser = user; callback(user); },
  };
}
const progress = { score: 1200, bestStreak: 5, level: 2, selectedTopic: 'math', finished: true, correctAnswer: true };

test('catalog, SQL seed, documentation and dashboard snippet agree', async () => {
  const { api } = harness();
  const sql = await readFile(new URL('../supabase/seed-achievements.sql', import.meta.url), 'utf8');
  const docs = await readFile(new URL('../docs/pickbits-sso.md', import.meta.url), 'utf8');
  assert.equal(api.ACHIEVEMENTS.length, 10);
  for (const a of api.ACHIEVEMENTS) {
    assert.match(a.slug, /^mmmunchers-[a-z0-9-]+$/);
    assert.ok(a.slug.length <= 50 && a.title.length <= 100 && a.description.length <= 255);
    assert.match(a.icon, /^fa-[a-z0-9-]+$/);
    assert.ok(['common', 'rare', 'epic', 'legendary'].includes(a.rarity));
    assert.ok(a.xp >= 10 && a.xp <= 100);
    const quote = text => `'${text.replaceAll("'", "''")}'`;
    assert.ok(sql.includes(`(${[a.slug, a.title, a.description, a.icon, a.rarity].map(quote).join(',')},${a.xp})`));
    assert.ok(docs.includes(`| ${a.slug} | ${a.title} | ${a.description} | ${a.icon} | ${a.rarity} | ${a.xp} |`));
  }
  assert.deepEqual([...sql.matchAll(/'mmmunchers-[a-z0-9-]+'/g)].map(m => m[0].slice(1, -1)).sort(), plain(api.ACHIEVEMENTS.map(a => a.slug)).sort());
  assert.match(sql, /where not exists/);
  assert.match(sql, /'arcade'/);
  const snippet = await readFile(new URL('../docs/pickbits-dashboard-snippet.js', import.meta.url), 'utf8');
  const branchStart = snippet.indexOf("if (slug === 'mmmunchers')");
  const entry = vm.runInNewContext(`(${snippet.slice(0, branchStart).trim().replace(/,$/, '')})`);
  assert.equal(entry.id, 'mmmunchers');
  const detail = new Function('slug', 'sum', 'n', snippet.slice(branchStart));
  assert.equal(detail('mmmunchers', { bestScore: 1200, bestStreak: 10, games: 2, topicsPlayed: ['math', 'music'] }, String), 'Best 1200 · Streak 10 · 2 games · 2 topics');
});

test('strict runtime gate blocks every SDK method, even with a preloaded SDK', () => {
  for (const url of ['http://localhost/', 'https://pickbits.ai.evil.test/', 'https://evilpickbits.ai/', 'file:///game.html', 'https://other.test/?pb=0']) {
    const mock = mockSdk({ currentUser: { id: 'one' } });
    const { api, scripts } = harness({ url, sdk: mock.sdk });
    api.initPickBits(); api.pbLogin(); api.submitScore(100); api.saveProgress();
    api.unlockAchievement('mmmunchers-first-game');
    api.recordCareerProgress(progress);
    assert.equal(api.isPbActive(), false);
    assert.equal(scripts.length, 0);
    assert.deepEqual(mock.calls, { init: [], saves: [], scores: [], unlocks: [], loads: 0, logins: 0 });
    assert.equal(api.readLocalCareer().games, 1);
  }
});

test('allowed origins and pb=1 inject once and tolerate an absent/partial SDK', () => {
  for (const url of ['https://mmmunchers.pickbits.ai/', 'http://localhost/?pb=1']) {
    const { api, scripts, window } = harness({ url });
    api.initPickBits(); api.initPickBits();
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, 'https://pickbits.ai/sdk/pickbits-sdk.js');
    scripts[0].onerror(); scripts[0].onload();
    window.PickBits = {};
    scripts[0].onload();
    api.pbLogin(); api.recordCareerProgress(progress);
    assert.equal(api.readLocalCareer().games, 1);
  }
});

test('v1/v2 login merge preserves progress earned while loading, syncs UI, and runs once per session', async () => {
  for (const wrapped of [false, true]) {
    let resolveLoad;
    const cloud = { v: 1, summary: { bestScore: 5000, bestStreak: 25, bestLevel: 10, games: 8, correctAnswers: 100, topicsPlayed: ['music'], achievements: ['mmmunchers-streak-25'] } };
    const mock = mockSdk({ currentUser: { id: 'one', username: 'muncher' }, load: () => new Promise(resolve => { resolveLoad = resolve; }) });
    const { api, events } = harness({ sdk: mock.sdk });
    api.subscribeCareerSync();
    api.recordCareerProgress(progress);
    api.initPickBits();
    api.recordCareerProgress(progress); // Local game ends while cloud is still in flight.
    assert.equal(mock.calls.saves.length, 0);
    resolveLoad(wrapped ? { save_data: cloud } : cloud);
    await settle();
    const career = plain(api.readLocalCareer());
    assert.equal(career.games, 10);
    assert.equal(career.correctAnswers, 102);
    assert.equal(career.bestScore, 5000);
    assert.equal(career.bestStreak, 25);
    assert.equal(career.bestLevel, 10);
    assert.deepEqual(career.topicsPlayed, ['math', 'music']);
    assert.ok(career.achievements.includes('mmmunchers-first-game'));
    assert.ok(career.achievements.includes('mmmunchers-streak-25'));
    assert.deepEqual(mock.calls.saves.at(-1), { data: { v: 1, summary: career }, opts: { slot: 0 } });
    assert.deepEqual(plain(api.useCareerState.getState().career), career);
    assert.ok(events.includes('mmmunchers:career_synced'));
    mock.auth({ id: 'one', username: 'refreshed' }); mock.auth(null); mock.auth({ id: 'one' });
    await settle();
    assert.equal(mock.calls.loads, 1);
    assert.equal(api.readLocalCareer().games, 10);
    assert.deepEqual(mock.calls.unlocks, []); // Anonymous unlocks are never replayed.
  }
});

test('logout discards a stale cloud response; failed loads never overwrite cloud', async () => {
  let resolveLoad;
  const mock = mockSdk({ currentUser: { id: 'one' }, load: () => new Promise(resolve => { resolveLoad = resolve; }) });
  const { api } = harness({ sdk: mock.sdk });
  api.initPickBits(); mock.auth(null);
  resolveLoad({ v: 1, summary: { games: 99 } });
  await settle();
  assert.equal(api.readLocalCareer().games, 0);
  assert.deepEqual(mock.calls.saves, []);
  for (const response of [{ error: 'offline' }, { v: 999, summary: { games: 99 } }]) {
    const failed = mockSdk({ currentUser: { id: 'one' }, load: async () => response });
    const h = harness({ sdk: failed.sdk });
    h.api.initPickBits(); await settle(); h.api.recordCareerProgress(progress); await settle();
    assert.equal(h.api.readLocalCareer().games, 1);
    assert.deepEqual(failed.calls.saves, []);
  }
});

test('run-end seam submits one positive integer and counts a game only once', async () => {
  const mock = mockSdk({ currentUser: { id: 'one' } });
  const { api } = harness({ sdk: mock.sdk });
  api.initPickBits(); await settle();
  api.useGameState.setState({ gamePhase: 'playing', score: 1234, streak: 7, bestStreak: 5, level: 3, selectedTopic: 'math' });
  api.useGameState.getState().gameOver(); api.useGameState.getState().gameOver();
  await settle();
  assert.equal(api.useGameState.getState().gamePhase, 'game_over');
  assert.equal(api.readLocalCareer().games, 1);
  assert.equal(api.readLocalCareer().bestStreak, 7);
  assert.deepEqual(mock.calls.scores, [1234]);
  for (const n of [0, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, 0.9]) api.submitScore(n);
  api.submitScore(42.9);
  assert.deepEqual(mock.calls.scores, [1234, 42]);
  assert.ok(mock.calls.saves.at(-1).data.summary.achievements.includes('mmmunchers-first-game'));
});

test('real answer and level seams track perfect boards, mistakes, streaks, resets, and all ten unlocks', async () => {
  const { api, timers } = harness();
  const state = api.useGameState;
  const board = () => [[
    { value: 'yes', isCorrect: true, isEmpty: false, isMunched: false },
    { value: 'no', isCorrect: false, isEmpty: false, isMunched: false },
  ]];
  state.setState({ gamePhase: 'playing', grid: board(), player: { x: 1, y: 0 }, gameMode: 'zen', currentChallenge: { description: 'test', checkAnswer: value => value === 'yes' } });
  state.getState().munchCurrentCell(); // Wrong answer disqualifies this board.
  state.getState().updatePlayer({ x: 0 }); state.getState().munchCurrentCell();
  assert.equal(api.readLocalCareer().correctAnswers, 1);
  assert.ok(!api.readLocalCareer().achievements.includes('mmmunchers-perfect-round'));
  state.setState({ gamePhase: 'playing', grid: board(), roundCorrectAnswers: 0, roundHadMistake: false });
  state.getState().loseLife(); state.getState().updatePlayer({ x: 0, y: 0 }); state.getState().munchCurrentCell();
  assert.ok(!api.readLocalCareer().achievements.includes('mmmunchers-perfect-round'));
  state.setState({ gamePhase: 'playing', grid: board(), player: { x: 0, y: 0 }, roundCorrectAnswers: 0, roundHadMistake: false });
  state.getState().munchCurrentCell(); state.getState().munchCurrentCell();
  assert.equal(api.readLocalCareer().correctAnswers, 3);
  assert.ok(api.readLocalCareer().achievements.includes('mmmunchers-perfect-round'));
  state.getState().gameOver();
  timers.forEach(cb => cb()); // A pending level transition cannot restart a finished run.
  assert.equal(state.getState().gamePhase, 'game_over');
  state.getState().initializeGame();
  assert.equal(state.getState().roundHadMistake, false);
  assert.equal(state.getState().roundCorrectAnswers, 0);
  for (let i = 0; i < 50; i++) api.recordCareerProgress({ ...progress, score: 5000, bestStreak: 25, level: 10, selectedTopic: api.TOPIC_IDS[i % 5] });
  assert.equal(api.readLocalCareer().achievements.length, 10);
});

test('dedupe survives reload and blocked storage; corrupt saves remain playable', async () => {
  for (const blocked of [false, true]) {
    const mock = mockSdk({ currentUser: { id: 'one' } });
    const { api, storage } = harness({ sdk: mock.sdk, blocked, stored: { mmmunchersCareer_v1: 'invalid json' } });
    api.initPickBits(); await settle();
    api.recordCareerProgress(progress); api.recordCareerProgress(progress);
    assert.equal(api.readLocalCareer().games, 2);
    assert.equal(mock.calls.unlocks.filter(s => s === 'mmmunchers-first-game').length, 1);
    if (!blocked) {
      const again = mockSdk({ currentUser: { id: 'one' } });
      const next = harness({ sdk: again.sdk, stored: Object.fromEntries(storage) });
      next.api.initPickBits(); await settle(); next.api.recordCareerProgress(progress);
      assert.deepEqual(again.calls.unlocks, []);
    }
  }
});

test('throwing and rejecting SDK methods never escape into gameplay', async () => {
  for (const reject of [false, true]) {
    const failure = () => { if (reject) return Promise.reject(Error('offline')); throw Error('offline'); };
    const mock = mockSdk({ currentUser: { id: 'one' } });
    const { api } = harness({ sdk: mock.sdk });
    api.initPickBits(); await settle();
    Object.assign(mock.sdk, { submitScore: failure, unlockAchievement: failure, saveProgress: failure });
    assert.doesNotThrow(() => { api.submitScore(10); api.recordCareerProgress(progress); });
    await settle();
    assert.equal(api.readLocalCareer().games, 1);
  }
  for (const name of ['init', 'getUser', 'onAuthChange', 'promptLogin', 'loadProgress']) {
    const mock = mockSdk({ currentUser: { id: 'one' } });
    mock.sdk[name] = () => { throw Error('offline'); };
    const { api } = harness({ sdk: mock.sdk });
    assert.doesNotThrow(() => { api.initPickBits(); api.pbLogin(); api.recordCareerProgress(progress); });
    await settle();
  }
});
