# Mmmunchers PickBits integration

Game slug: `mmmunchers`. SDK: `https://pickbits.ai/sdk/pickbits-sdk.js`, injected at runtime and never bundled. The bridge follows the React/Vite Zombie Survival reference and the arcade-sso-wiring playbook. The SDK's newer leaderboard reads and `levels.*` exports were inspected; this integration uses its auth, score, save, and achievement APIs. No economy is configured: there is no persistent spendable wallet.

## Runtime and persistence

The SDK activates only on an HTTP(S) subdomain of `pickbits.ai` or an HTTP(S) URL with `?pb=1`. Other origins and native wrappers perform no SDK operations and never request its script. Optional methods are existence-checked and all SDK calls catch synchronous errors and promise rejections. Gameplay and local career updates do not await the SDK.

Local career storage is `mmmunchersCareer_v1`, with an in-memory fallback for unavailable or full storage. Existing `category_<topicId>` preferences stay local and keep their original keys. The category save also requests a career cloud save. The menu displays career progress; the visible bottom-right auth chip exposes `data-testid="pb-auth-state"`, showing the username (display name fallback) or `anon`. It sits below the top HUD and away from movement/munch controls.

On the first successful login reconciliation per account in this page session, `loadProgress({slot: 0})` unwraps `res.save_data ?? res`. Best score, streak, and level take their maximum; games and correct answers sum; topics and achievement sets union. Repeated profile notifications and logout/login for the same account do not re-add totals in the same session. The bridge reads local progress **after** the cloud await, persists the merged career, fires `mmmunchers:career_synced` for the Zustand store to re-read, and pushes the merged payload. Writes wait for reconciliation and are serialized/coalesced. Stale loads after logout are discarded. Rejected or unsupported loads preserve local progress and do not push over an unknown cloud save; a later save/auth seam may retry.

This is the playbook's additive career reconciliation, not a resumable board save or a ledger of unique runs. A new page session merges totals again using the requested sum rule. The SDK itself represents some failed reads as `null`, which the bridge must treat as an empty save under its current API.

## Save summary contract

Cloud payload: `{ v: 1, summary: CareerStats }`, slot 0. Local storage holds the summary itself. All numeric fields are nonnegative safe integers. Topics use the eleven known IDs and achievements use the ten catalog slugs, keeping the summary bounded.

| Field | Meaning |
| --- | --- |
| `bestScore` | Highest score reached in any game |
| `bestStreak` | Longest correct-answer streak |
| `bestLevel` | Highest level reached |
| `games` | Games finished through `gameOver()`; quitting to the menu is not a completed game |
| `correctAnswers` | Correct cells munched across games, recorded immediately |
| `topicsPlayed` | Unique topic IDs whose first board successfully started |
| `achievements` | Locally deduplicated unlocked catalog slugs, including anonymous unlocks |

```json
{
  "v": 1,
  "summary": {
    "bestScore": 1200,
    "bestStreak": 10,
    "bestLevel": 3,
    "games": 2,
    "correctAnswers": 40,
    "topicsPlayed": ["math", "music"],
    "achievements": [
      "mmmunchers-first-game",
      "mmmunchers-streak-5",
      "mmmunchers-streak-10",
      "mmmunchers-score-1000"
    ]
  }
}
```

The supplied dashboard branch formats this as `Best 1,200 · Streak 10 · 2 games · 2 topics` using the dashboard's existing `n()` number formatter.

## Achievement catalog

This is Mmmunchers' only catalog. Unlocks persist before the PickBits mirror is invoked. Only newly earned slugs are mirrored, only when signed in and the SDK is ready. Anonymous, offline, and cloud-imported unlocks are not replayed on login. Local dedupe survives reloads; in-memory dedupe remains when storage is blocked.

| Slug | Title | Description | Icon | Rarity | XP |
| --- | --- | --- | --- | --- | --- |
| mmmunchers-first-game | FIRST BITE | Finish your first game. | fa-utensils | common | 10 |
| mmmunchers-streak-5 | GET MUNCHING | Chain 5 correct answers without breaking your streak. | fa-fire | common | 15 |
| mmmunchers-streak-10 | BRAIN BUFFET | Chain 10 correct answers without breaking your streak. | fa-brain | rare | 30 |
| mmmunchers-streak-25 | UNSTOPPABLE APPETITE | Chain 25 correct answers without breaking your streak. | fa-bolt | epic | 80 |
| mmmunchers-score-1000 | THOUSAND CRUNCH | Score 1,000 points in one game. | fa-star | common | 20 |
| mmmunchers-score-5000 | FEAST MODE | Score 5,000 points in one game. | fa-trophy | rare | 50 |
| mmmunchers-topics-5 | BALANCED DIET | Play 5 different topics. | fa-book-open | rare | 40 |
| mmmunchers-games-50 | REGULAR AT THE ARCADE | Finish 50 games. | fa-gamepad | epic | 100 |
| mmmunchers-perfect-round | CLEAN PLATE | Clear a board with no wrong answers or lost lives. | fa-check-circle | rare | 30 |
| mmmunchers-level-10 | TOP OF THE FOOD CHAIN | Reach level 10 in one game. | fa-crown | epic | 80 |

A round means one board. At least one correct answer and no wrong answers or life loss are required for CLEAN PLATE. Counters reset when each board starts. Streak milestones follow the game's existing mode-specific streak resets. Games count at run end; topic, score, streak, perfect-board and level milestones can unlock during play.

## Wired seams

| Seam | File:line |
| --- | --- |
| Runtime injection and init at boot | `client/src/main.tsx:6`, `client/src/lib/pickbits.ts:39` |
| Auth subscription and visible chip | `client/src/lib/pickbits.ts:69`, `client/src/components/PickBitsAuth.tsx:4`, `client/src/App.tsx:73` |
| First-login load, merge, local persist, event, cloud push | `client/src/lib/pickbits.ts:115` |
| Cloud event re-read by Zustand / mounted listener | `client/src/lib/stores/useCareerState.ts:18`, `client/src/App.tsx:17` |
| Existing category save requests cloud save | `client/src/components/MainMenu.tsx:136` |
| Career menu display | `client/src/components/MainMenu.tsx:240` |
| Topic played / new board resets | `client/src/lib/stores/useGameState.tsx:267` |
| Natural run end: positive integer score and finished-game career/save | `client/src/lib/stores/useGameState.tsx:309` |
| Correct answer accumulation and live score/streak milestones | `client/src/lib/stores/useGameState.tsx:388` |
| Wrong answers / life loss disqualify a perfect board | `client/src/lib/stores/useGameState.tsx:402`, `client/src/lib/stores/useGameState.tsx:547` |
| Clear-board perfect-round and level milestones | `client/src/lib/stores/useGameState.tsx:492` |
| Local career save, new unlock dedupe/mirror, cloud write-through | `client/src/lib/stores/useCareerState.ts:7` |
| Catalog, localStorage, and cloud envelope | `client/src/lib/careerStats.ts:21`, `client/src/lib/careerStats.ts:105`, `client/src/lib/careerStats.ts:113` |
| Guarded score, achievement and save SDK calls | `client/src/lib/pickbits.ts:94`, `client/src/lib/pickbits.ts:105`, `client/src/lib/pickbits.ts:138` |

## Verification and platform handoff

Verified in this worktree on 2026-09-12:

```text
npm run check      PASS (tsc, exit 0)
npm run build      PASS (Vite 5.4.19, 2200 modules, 25.15s)
npm test           PASS (13 tests, 13 passed, 0 failed, 16.94s)
git diff --check   PASS
```

Build output includes advisory warnings for outdated Browserslist data and the existing large application chunk (1,308.74 kB, gzip 376.35 kB). Desktop and mobile screenshots were visually reviewed; the auth chip clears the HUD, keyboard hint, and touch controls. Browser scenarios reported no uncaught errors or unhandled rejections.

Run `npm run check`, `npm run build`, then `npm test`. There was no existing test runner or test script; tests use Node's built-in runner. The browser test imports the already available Playwright by absolute path from `C:/new/asset-factory/node_modules/playwright/index.mjs`, with no dependency added. Contract tests use the esbuild already installed by Vite.

The Chromium tests route production files from `dist/public` on fake `http://mmmunchers.pickbits.ai/?pb=1`, load the real SDK source from disk with a deterministic anonymous session, and separately abort its request to simulate network failure. An off-origin case asserts zero SDK requests; a mobile case checks the same interactive flow. All other external requests are aborted. Chromium uses its default pipe transport: no TCP port is bound. Tests select 2D, start a Streak/Mathematics board, and munch through a real keyboard input. They assert the anon chip, no uncaught exceptions/unhandled rejections, local topic/category persistence, and a changed score or game-over state. Screenshots are written to ignored `screenshots/pickbits-*.png` for visual review.

Contract tests cover both cloud response shapes, max/sum/union merging, play during cloud loading, repeated auth/re-login dedupe, stale loads, malformed saves, storage failures, one score per run end, achievement milestones, perfect-board rules, and throwing/rejecting SDK methods. They also verify exact catalog parity with the SQL and docs and execute the dashboard fragments in their intended contexts.

`supabase/seed-achievements.sql` is the playbook's idempotent seed, ready for the platform owner to run. It has not been executed. `docs/pickbits-dashboard-snippet.js` contains only the ARCADE entry and the `saveDetail()` branch, intended for insertion in their respective contexts (not a standalone JavaScript module). The platform owner should also add `connected:true` and `feat:['Sign in','Cloud saves','Achievements']` to Mmmunchers' existing `arcade.html` entry. No platform repo was edited, no SQL was run, and no commit was made.

Live signed-in leaderboard/save/achievement writes, the deployed game, and the dashboard remain a platform verification step after seeding, snippet integration, and deployment. The local tests use no live account or remote write.

## Files delivered

| File | Change |
| --- | --- |
| `client/src/lib/pickbits.ts` | New runtime SDK bridge |
| `client/src/lib/careerStats.ts` | New career model, storage, merge rules, catalog and save envelope |
| `client/src/lib/stores/useCareerState.ts` | New career store, unlock/save seam and sync listener |
| `client/src/components/PickBitsAuth.tsx` | New visible auth chip and sign-in button |
| `client/src/main.tsx` | SDK boot call |
| `client/src/App.tsx` | Auth chip and career sync subscription |
| `client/src/lib/stores/useGameState.tsx` | Gameplay counters and career/score seams |
| `client/src/components/MainMenu.tsx` | Career display and existing category save seam |
| `package.json` | `npm test` using Node's built-in runner; no new dependencies |
| `e2e/pickbits-anon.spec.mjs` | Four Chromium acceptance scenarios without a server |
| `e2e/pickbits-contract.spec.mjs` | Nine career, SDK failure and handoff contract checks |
| `supabase/seed-achievements.sql` | Idempotent, unexecuted catalog seed |
| `docs/pickbits-dashboard-snippet.js` | ARCADE entry and saveDetail branch only |
| `docs/pickbits-sso.md` | Integration contract, catalog, seams and verification |
