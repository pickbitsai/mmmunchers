export const CAREER_VERSION = 1;
export const CAREER_KEY = 'mmmunchersCareer_v1';
export const CAREER_SYNC_EVENT = 'mmmunchers:career_synced';

export const TOPIC_IDS = [
  'math', 'words', 'marvel', 'movies', 'science', 'history', 'geography',
  'animals', 'dinosaurs', 'music', 'surfing',
] as const;

export interface CareerStats {
  bestScore: number;
  bestStreak: number;
  bestLevel: number;
  games: number;
  correctAnswers: number;
  topicsPlayed: string[];
  achievements: string[];
}

/** The game's only achievement catalog; SQL and dashboard documentation mirror it. */
export const ACHIEVEMENTS = [
  { slug: 'mmmunchers-first-game', title: 'FIRST BITE', description: 'Finish your first game.', icon: 'fa-utensils', rarity: 'common', xp: 10 },
  { slug: 'mmmunchers-streak-5', title: 'GET MUNCHING', description: 'Chain 5 correct answers without breaking your streak.', icon: 'fa-fire', rarity: 'common', xp: 15 },
  { slug: 'mmmunchers-streak-10', title: 'BRAIN BUFFET', description: 'Chain 10 correct answers without breaking your streak.', icon: 'fa-brain', rarity: 'rare', xp: 30 },
  { slug: 'mmmunchers-streak-25', title: 'UNSTOPPABLE APPETITE', description: 'Chain 25 correct answers without breaking your streak.', icon: 'fa-bolt', rarity: 'epic', xp: 80 },
  { slug: 'mmmunchers-score-1000', title: 'THOUSAND CRUNCH', description: 'Score 1,000 points in one game.', icon: 'fa-star', rarity: 'common', xp: 20 },
  { slug: 'mmmunchers-score-5000', title: 'FEAST MODE', description: 'Score 5,000 points in one game.', icon: 'fa-trophy', rarity: 'rare', xp: 50 },
  { slug: 'mmmunchers-topics-5', title: 'BALANCED DIET', description: 'Play 5 different topics.', icon: 'fa-book-open', rarity: 'rare', xp: 40 },
  { slug: 'mmmunchers-games-50', title: 'REGULAR AT THE ARCADE', description: 'Finish 50 games.', icon: 'fa-gamepad', rarity: 'epic', xp: 100 },
  { slug: 'mmmunchers-perfect-round', title: 'CLEAN PLATE', description: 'Clear a board with no wrong answers or lost lives.', icon: 'fa-check-circle', rarity: 'rare', xp: 30 },
  { slug: 'mmmunchers-level-10', title: 'TOP OF THE FOOD CHAIN', description: 'Reach level 10 in one game.', icon: 'fa-crown', rarity: 'epic', xp: 80 },
] as const;

export function emptyCareer(): CareerStats {
  return { bestScore: 0, bestStreak: 0, bestLevel: 0, games: 0, correctAnswers: 0, topicsPlayed: [], achievements: [] };
}

function count(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(value))) : 0;
}

export function normalizeCareer(raw: unknown): CareerStats {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  return {
    bestScore: count(o.bestScore), bestStreak: count(o.bestStreak), bestLevel: count(o.bestLevel),
    games: count(o.games), correctAnswers: count(o.correctAnswers),
    topicsPlayed: TOPIC_IDS.filter(id => Array.isArray(o.topicsPlayed) && o.topicsPlayed.includes(id)),
    achievements: ACHIEVEMENTS.map(a => a.slug).filter(slug => Array.isArray(o.achievements) && o.achievements.includes(slug)),
  };
}

/** First login: max bests, sum totals, union topic and unlock sets. */
export function mergeCareer(local: unknown, cloud: unknown): CareerStats {
  const a = normalizeCareer(local), b = normalizeCareer(cloud);
  return normalizeCareer({
    bestScore: Math.max(a.bestScore, b.bestScore),
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    bestLevel: Math.max(a.bestLevel, b.bestLevel),
    games: a.games + b.games,
    correctAnswers: a.correctAnswers + b.correctAnswers,
    topicsPlayed: [...a.topicsPlayed, ...b.topicsPlayed],
    achievements: [...a.achievements, ...b.achievements],
  });
}

export interface CareerProgress {
  score: number;
  bestStreak: number;
  level: number;
  selectedTopic: string | null;
  correctAnswer?: boolean;
  finished?: boolean;
  perfectRound?: boolean;
}

export function applyProgress(before: CareerStats, progress: CareerProgress): CareerStats {
  const after = mergeCareer(before, {
    bestScore: progress.score, bestStreak: progress.bestStreak, bestLevel: progress.level,
    games: progress.finished ? 1 : 0, correctAnswers: progress.correctAnswer ? 1 : 0,
    topicsPlayed: progress.selectedTopic ? [progress.selectedTopic] : [],
  });
  const earned = [
    after.games >= 1, after.bestStreak >= 5, after.bestStreak >= 10, after.bestStreak >= 25,
    after.bestScore >= 1000, after.bestScore >= 5000, after.topicsPlayed.length >= 5,
    after.games >= 50, progress.perfectRound === true, after.bestLevel >= 10,
  ];
  return normalizeCareer({ ...after, achievements: [
    ...after.achievements, ...ACHIEVEMENTS.filter((_, i) => earned[i]).map(a => a.slug),
  ] });
}

// Keep an in-memory fallback for blocked/quota-limited storage, including unlock dedupe.
let memory = emptyCareer();
let storageWriteFailed = false;
export function readLocalCareer(): CareerStats {
  if (storageWriteFailed) return normalizeCareer(memory);
  try {
    const raw = localStorage.getItem(CAREER_KEY);
    if (raw) memory = normalizeCareer(JSON.parse(raw));
  } catch { /* Local play remains available. */ }
  return normalizeCareer(memory);
}

export function writeLocalCareer(career: CareerStats): void {
  memory = normalizeCareer(career);
  try {
    localStorage.setItem(CAREER_KEY, JSON.stringify(memory));
    storageWriteFailed = false;
  } catch { storageWriteFailed = true; }
}

export function toPayload(career: CareerStats) {
  return { v: CAREER_VERSION, summary: normalizeCareer(career) };
}

export function careerFromCloud(res: unknown): CareerStats | null {
  if (!res || typeof res !== 'object') return null;
  const payload = (res as Record<string, unknown>).save_data ?? res;
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  return p.v === CAREER_VERSION && p.summary && typeof p.summary === 'object' && !Array.isArray(p.summary)
    ? normalizeCareer(p.summary) : null;
}
