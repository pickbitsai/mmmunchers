import {
  ACHIEVEMENTS, CAREER_SYNC_EVENT, careerFromCloud, mergeCareer,
  readLocalCareer, toPayload, writeLocalCareer,
} from './careerStats';

const GAME_SLUG = 'mmmunchers';
const SDK_URL = 'https://pickbits.ai/sdk/pickbits-sdk.js';

export interface PbUser {
  id: string;
  username?: string | null;
  display_name?: string | null;
}

interface PickBitsSdk {
  init?: (opts: { gameSlug: string }) => void;
  getUser?: () => PbUser | null;
  onAuthChange?: (cb: (user: PbUser | null) => void) => void;
  promptLogin?: () => void;
  submitScore?: (score: number) => Promise<unknown>;
  loadProgress?: (opts: { slot: number }) => Promise<unknown>;
  saveProgress?: (data: unknown, opts: { slot: number }) => Promise<unknown>;
  unlockAchievement?: (slug: string) => Promise<unknown>;
}

declare global { interface Window { PickBits?: PickBitsSdk } }

let started = false, active = false, ready = false;
let user: PbUser | null = null;
let authEpoch = 0;
const reconciled = new Set<string>();
const loading = new Map<string, number>();
const attemptedUnlocks = new Set<string>();
const subscribers = new Set<(user: PbUser | null) => void>();
let saving = false, saveRequested = false;

export function isPbActive(): boolean { return active; }

export function initPickBits(): void {
  if (started) return;
  started = true;
  try {
    active = /^https?:$/.test(window.location.protocol) && (
      /\.pickbits\.ai$/.test(window.location.hostname) ||
      new URLSearchParams(window.location.search).get('pb') === '1'
    );
    if (!active) return;
    if (window.PickBits) { connectSdk(); return; }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = connectSdk;
    script.onerror = () => { /* Anonymous/offline play needs no SDK. */ };
    document.head.appendChild(script);
  } catch { /* Never block boot. */ }
}

function connectSdk(): void {
  try {
    const pb = window.PickBits;
    if (!active || ready || typeof pb?.init !== 'function') return;
    pb.init({ gameSlug: GAME_SLUG }); // No persistent spendable wallet.
    ready = true;
    try { if (typeof pb.onAuthChange === 'function') pb.onAuthChange(onAuth); } catch { /* Optional. */ }
    try { if (typeof pb.getUser === 'function') onAuth(pb.getUser()); } catch { /* Stay anon. */ }
  } catch { /* SDK absent, partial, or offline. */ }
}

function onAuth(next: PbUser | null): void {
  if (!active || !ready) return;
  if (user?.id !== next?.id) authEpoch++;
  user = next?.id ? next : null;
  subscribers.forEach(cb => { try { cb(user); } catch { /* Isolate subscribers. */ } });
  if (user) {
    if (!reconciled.has(user.id)) void reconcileCloud();
    else saveProgress();
  }
}

export function onPbAuth(cb: (user: PbUser | null) => void): () => void {
  subscribers.add(cb);
  try { cb(user); } catch { /* Isolate subscribers. */ }
  return () => { subscribers.delete(cb); };
}

export function pbLogin(): void {
  if (!active || !ready) return;
  try {
    const pb = window.PickBits;
    if (typeof pb?.promptLogin === 'function') pb.promptLogin();
  } catch { /* Optional service. */ }
}

export function submitScore(score: number): void {
  if (!active || !ready || !user || !Number.isFinite(score)) return;
  const n = Math.trunc(score);
  if (!Number.isSafeInteger(n) || n <= 0) return;
  try {
    const pb = window.PickBits;
    if (typeof pb?.submitScore === 'function') void Promise.resolve(pb.submitScore(n)).catch(() => {});
  } catch { /* Fire-and-forget. */ }
}

/** Called only at the career store's NEW unlock seam, after local dedupe is saved. */
export function unlockAchievement(slug: string): void {
  if (!active || attemptedUnlocks.has(slug) || !ACHIEVEMENTS.some(a => a.slug === slug)) return;
  attemptedUnlocks.add(slug);
  if (!ready || !user) return;
  try {
    const pb = window.PickBits;
    if (typeof pb?.unlockAchievement === 'function') void Promise.resolve(pb.unlockAchievement(slug)).catch(() => {});
  } catch { /* No replay of anonymous or failed unlocks on login. */ }
}

async function reconcileCloud(): Promise<void> {
  const id = user?.id, epoch = authEpoch;
  if (!active || !ready || !id || reconciled.has(id) || loading.get(id) === epoch) return;
  loading.set(id, epoch);
  try {
    const pb = window.PickBits;
    if (typeof pb?.loadProgress !== 'function') return;
    const res = await pb.loadProgress({ slot: 0 });
    if (user?.id !== id || authEpoch !== epoch) return;
    const cloud = careerFromCloud(res);
    // A failed/unknown save is not an empty save: do not overwrite it.
    if (res != null && !cloud) return;
    // Read AFTER the await so play during login is included.
    const local = readLocalCareer();
    writeLocalCareer(cloud ? mergeCareer(local, cloud) : local);
    reconciled.add(id); // Once per account for this page session, including re-login.
    try { window.dispatchEvent(new CustomEvent(CAREER_SYNC_EVENT)); } catch { /* Optional UI. */ }
    saveProgress();
  } catch { /* Preserve local; retry on a later auth/save seam. */ }
  finally { if (loading.get(id) === epoch) loading.delete(id); }
}

/** Write-through from local saves; serialize/coalesce writes and wait for login merge. */
export function saveProgress(): void {
  if (!active || !ready || !user) return;
  if (!reconciled.has(user.id)) { void reconcileCloud(); return; }
  saveRequested = true;
  if (!saving) void flushSaves();
}

async function flushSaves(): Promise<void> {
  saving = true;
  try {
    while (saveRequested) {
      saveRequested = false;
      if (!active || !ready || !user || !reconciled.has(user.id)) return;
      const pb = window.PickBits;
      if (typeof pb?.saveProgress !== 'function') return;
      await pb.saveProgress(toPayload(readLocalCareer()), { slot: 0 });
    }
  } catch { /* Local writes already succeeded; cloud is best effort. */ }
  finally { saving = false; }
}
