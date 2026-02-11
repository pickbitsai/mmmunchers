# Code Review: Mmmunchers

**Verdict**: This project works, but it was built by bolting things on rather than designing them. If rebuilt today based on what it *actually does*, roughly 60% of the code and dependencies would not exist.

---

## 1. Dependency Bloat (Critical)

**48 UI components installed, 4 used.**

The project ships 48 shadcn/ui components. A `grep` across all game components shows exactly four are imported: `button`, `card`, `select`, `sonner`. The other 44 — accordion, calendar, carousel, chart, command palette, context menu, data table, drawer, form, hover card, input-otp, menubar, navigation menu, pagination, resizable panels, sidebar (779 lines by itself), etc. — are dead weight.

**Unused npm packages** that should be removed:

| Package | Why it's here | Why it shouldn't be |
|---------|--------------|-------------------|
| `pixi.js` | "2D fallback" | GameBoard2D uses a plain `<div>` grid, not PixiJS. Never imported. |
| `matter-js` | Physics engine | No physics in the game. Never imported. |
| `react-leaflet` | Map library | There are no maps. |
| `recharts` | Charting | There are no charts. |
| `react-syntax-highlighter` | Code display | There is no code display. |
| `react-confetti` | Celebration effect | Never imported in any component. |
| `react-icons` | Icons | The project uses `lucide-react` for icons. |
| `react-hook-form` | Form handling | The one input field uses raw `useState`. |
| `react-helmet-async` | SEO/meta tags | Single-page game with one route. |
| `react-router-dom` / `wouter` | Routing | Two routing libraries, neither used meaningfully (one 404 page). |
| `passport` / `passport-local` | Authentication | There is no auth. No login. No users. |
| `express-session` / `connect-pg-simple` / `memorystore` | Sessions | No sessions exist. |
| `gsap` | Animation | Animations use CSS transitions and framer-motion. |
| `ogl` | WebGL | Three.js is the WebGL renderer. |
| `react-haiku` | Animation hooks | Not imported. |
| `react-use-gesture` | Gesture handling | Not imported. |
| `react-useanimations` | Animated icons | Not imported. |
| `gl-matrix` | Matrix math | Three.js handles all matrix operations. |
| `meshline` | Line rendering | Not imported. |
| `r3f-perf` | Performance monitor | Dev tool left in production deps. |
| `ws` | WebSockets | No WebSocket communication exists. |
| `date-fns` | Date formatting | No date formatting in the app. |
| `next-themes` | Next.js themes | This is not a Next.js app. |
| `embla-carousel-react` | Carousel engine | Carousel UI component is unused. |
| `cmdk` | Command palette | Command palette UI component is unused. |
| `vaul` | Drawer | Drawer UI component is unused. |
| `input-otp` | OTP input | OTP input UI component is unused. |
| `react-day-picker` | Date picker | Calendar UI component is unused. |
| `react-resizable-panels` | Resizable panels | Resizable UI component is unused. |
| `framer-motion` | Animation | Used minimally; CSS transitions would suffice. |
| `zod-validation-error` | Zod error formatting | Never imported. |

**The actual runtime dependencies for what this app does:**
`react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `zustand`, `howler`, `express`, `zod`, `drizzle-orm`, `lucide-react`, `tailwindcss`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot` (for the Button component).

That's ~18 packages vs the current ~100. The `node_modules` footprint is inflated for no reason.

---

## 2. The aiService.ts Monster (1,092 lines)

`client/src/lib/services/aiService.ts` is the worst file in the project. It is a 1,092-line class that is 80% hardcoded string arrays pretending to be "AI."

### What it actually does:
1. Makes a `fetch` call to `/api/ai-generate` (the real AI part — 15 lines of actual logic)
2. Falls back to **700+ lines of hardcoded word lists** when the API isn't available

### Specific problems:

**Duplicated data across 3 methods:**
- `isItemRelevantToTopic()` (line 310): hardcoded word lists for electricity, music, cooking, lego, surfing, shoes, eggs
- `getTopicKeywords()` (line 334): hardcoded word lists for surfing, space, music, cooking, animals, fallout (the Fallout list alone is 100+ words)
- `generateMockContent()` (line 500): hardcoded content for egypt, space, dinosaurs, animals, music, history, science, surfing

The same topics appear in 3 different methods with 3 different word lists that don't match each other. Surfing-related words are defined in at least 4 separate places across the file.

**The "semantic similarity" function is a joke:**
```typescript
private isSemanticallySimilar(item: string, topic: string): boolean {
  // Checks if one string contains the other. That's it.
  // "isSemanticallySimilar" is a lie.
}
```

**`normalizeTopic()` is a hand-rolled spellchecker:**
30+ hardcoded typo corrections (`'egeypt' -> 'egypt'`, `'dinasour' -> 'dinosaur'`). This same function is copy-pasted into `CustomTopic.tsx` (line 361). Two copies of the same typo dictionary.

**What this should be:**
- A thin client that calls the server API
- Mock/fallback data in a JSON file, not a class
- Zero "semantic similarity" pretense — just use the data the AI returns

---

## 3. The God Store (`useGameState.tsx`, 475 lines)

This Zustand store does everything: state management, game initialization, topic provider instantiation, grid generation orchestration, player movement, enemy spawning, level progression, scoring, and UI toasts.

### Specific problems:

**Topic provider instantiation via switch statement (line 181):**
```typescript
switch (topicId) {
  case 'math': provider = new MathTopic(); break;
  case 'words': provider = new WordTopic(); break;
  // ...
}
```
This should be a registry/map, not a switch. Adding a new topic requires editing the store.

**localStorage as a state bus (line 195-206):**
```typescript
const customTopicName = localStorage.getItem('customTopic') || 'Custom Topic';
const savedCategory = localStorage.getItem(`category_${topicId}`);
```
TopicSelection writes to localStorage, then useGameState reads from it. This is an anti-pattern. Pass the data as arguments.

**Module-level mutable state (lines 88-116):**
```typescript
let cachedGridDimensions: { width: number; height: number } | null = null;
let lastWindowWidth = 0;
```
Mutable globals outside the store. `GRID_DIMENSIONS` is computed once at import time but the game needs to be responsive. There's a `getGridDimensions()` function that's called later, making the initial calculation at line 114 useless.

**`setTimeout` for level transitions (line 463):**
```typescript
setTimeout(() => {
  get().startGame();
  get().spawnEnemies();
}, 1500);
```
Unmanaged timeout. If the component unmounts or the user navigates away during those 1.5 seconds, this fires into the void. No cleanup.

**What this should be:**
- Split into 3-4 smaller stores or slices: `gameSessionStore` (phase, topic, level), `boardStore` (grid, player, enemies), `scoreStore` (score, lives)
- Topic registry as a simple object map
- No localStorage bridge — use function arguments or store composition

---

## 4. Duplicated Type Definitions

`GridCell` is defined in two places:
- `client/src/lib/topics/TopicProvider.ts:3-8`
- `client/src/lib/stores/useGameState.tsx:15-20`

Both are identical. Both are imported by different parts of the app. This is a bug waiting to happen — change one and the other silently diverges.

Should be defined once in a shared types file.

---

## 5. Category Lists Defined in 3 Places

Category definitions for each topic exist in:
1. **`TopicSelection.tsx`** (lines 146-188): `getTopicCategories()` with hardcoded category arrays
2. **`MathTopic.ts`** (lines 15-25): `getCategories()` method
3. **Other topic classes**: Each has its own category list

TopicSelection doesn't read categories from the topic providers — it has its own parallel copy. If you add a category to MathTopic, it won't appear in the UI unless you also edit TopicSelection.

---

## 6. GameBoard2D.tsx: Inline Business Logic in JSX

The 2D board component has a 90-line IIFE inside its JSX (lines 281-370) that calculates font sizes and breaks words. This is rendering logic mixed with text layout algorithms mixed with JSX.

```tsx
style={{
  fontSize: (() => {
    const text = cell.value;
    const charCount = text.length;
    // ... 20 lines of font size calculation
  })()
}}
```

And then another IIFE for word breaking:
```tsx
{(() => {
  const text = cell.value;
  const words = text.split(' ');
  // ... 50 lines of word wrapping logic
})()}
```

This should be extracted into utility functions. The component should be declarative, not a word processor.

---

## 7. No Tests

Zero test files. No test runner configured. No vitest, no jest, no playwright, nothing. For a game with math validation, enemy AI pathfinding, grid generation, and answer checking — this is a liability.

The `checkAnswer` closures in MathTopic are doing real math (`isPrime`, `isFactorOf`). These need tests. The enemy AI behavior needs tests. The grid generation (ensuring correct/incorrect ratio) needs tests.

---

## 8. Console Logging Everywhere

Production code is littered with `console.log` statements:

- `aiService.ts`: 15+ console.log/warn/error calls
- `useGameState.tsx`: `console.log("Generated game content:", ...)`, `console.log("Spawning enemies:", ...)`, `console.log("Created enemies:", ...)`
- `CustomTopic.tsx`: `console.log('CustomTopic - Generated challenge data:', ...)`, emoji-prefixed logs (`✓`, `✗`)
- `gameLogic.ts`: Audio-related logs

These should not ship. Use a debug flag or strip them in production.

---

## 9. Server Architecture Issues

### In-memory storage with a database schema
`server/storage.ts` implements `MemStorage` — a `Map` that loses everything on restart. Meanwhile, `shared/schema.ts` defines full Drizzle ORM schemas with PostgreSQL tables (`gameProgress`, `topicContentCache`). The database integration is defined but never wired up. The `MemStorage` class exists because someone gave up on the database.

### Rate limiter leaks memory
`server/routes.ts` line 127:
```typescript
const aiRequestTracker = new Map<string, { count: number, lastRequest: number }>();
```
This map grows forever. Old entries are never cleaned up. Every unique IP that hits the endpoint stays in memory until the process restarts. A proper rate limiter (e.g., `express-rate-limit`) would handle this correctly.

### OpenAI response parsed twice
The server parses the OpenAI response in `routes.ts` (lines 220-246). The client also has `parseOpenAIResponse()` in `aiService.ts` (lines 450-498). The server already validates and restructures the data — the client parser is dead code that's never reached.

---

## 10. Architectural Mismatches

### Three rendering engines, one used
- `three` / `@react-three/fiber` — the actual 3D renderer (used)
- `pixi.js` — listed as "2D fallback" in CLAUDE.md but never imported
- `matter-js` — physics engine, never imported

GameBoard2D doesn't use a canvas library at all. It renders `<div>` elements with absolute positioning. The "2D mode" is just HTML.

### Two routing libraries
Both `react-router-dom` and `wouter` are installed. The app has one route.

### Authentication stack for a single-player game
`passport`, `passport-local`, `express-session`, `connect-pg-simple`, `memorystore` — a full auth stack for a game with no login, no users, and no persistent state.

---

## 11. The Custom Topic / AI Service Boundary

The relationship between `CustomTopic.tsx` and `aiService.ts` is tangled:

1. `CustomTopic.generateChallenge()` calls `aiService.generateChallenge()`
2. `aiService.generateChallenge()` calls `aiService.generateTopicContent()` *again* internally
3. `CustomTopic.generateContent()` also calls `aiService.generateTopicContent()` separately
4. Both classes have their own `normalizeTopic()` with duplicated dictionaries
5. Both classes have their own hardcoded distractor pools for the same topics
6. `CustomTopic.generateGrid()` calls `generateAdditionalDistractors()` which has *another* set of hardcoded word lists

The flow for a single custom game:
```
CustomTopic.generateChallenge()
  -> aiService.generateChallenge()
    -> aiService.generateTopicContent() [first call]
  -> CustomTopic.generateContent()
    -> aiService.generateTopicContent() [second call, hits cache]
  -> CustomTopic.generateGrid()
    -> CustomTopic.generateAdditionalDistractors() [third source of word lists]
```

Three layers of indirection, two sources of truth for "what's correct," and duplicated fallback data.

---

## 12. Recommended Structure If Rebuilt

```
src/
  game/
    state/
      gameSession.ts          # Phase, topic, level (tiny store)
      board.ts                 # Grid, player, enemies (data store)
      score.ts                 # Score, lives (tiny store)
    logic/
      enemyAI.ts              # Pure functions for enemy movement
      gridGenerator.ts        # Pure function: (topic, level, size) -> Grid
      collision.ts            # Pure function: (player, enemies) -> boolean
    topics/
      types.ts                # TopicProvider interface, GridCell type (ONE definition)
      registry.ts             # { math: MathTopic, words: WordTopic, ... }
      math.ts
      words.ts
      marvel.ts
      movies.ts
    rendering/
      Board3D.tsx             # Three.js board
      Board2D.tsx             # HTML/CSS board (what it actually is)
      Player.tsx
      Enemy.tsx
      GridCell.tsx
    ui/
      HUD.tsx                 # Score, lives, level bar
      TopicPicker.tsx          # Topic selection (reads categories FROM providers)
      PauseOverlay.tsx
      GameOverOverlay.tsx
      MobileControls.tsx
    hooks/
      useGameLoop.ts          # requestAnimationFrame management
      useKeyboard.ts          # Input handling
  api/
    client.ts                 # fetch wrapper for /api/* calls
    aiGenerate.ts             # Server-side AI proxy call
  components/
    Button.tsx                # The 4 UI primitives actually used
    Card.tsx
    Select.tsx
    Toast.tsx (sonner)

server/
  index.ts
  routes/
    topicContent.ts           # GET/POST /api/topic-content
    aiGenerate.ts             # POST /api/ai-generate
  storage/
    interface.ts              # IStorage
    postgres.ts               # Drizzle implementation (use it or delete it)
  middleware/
    rateLimit.ts              # Use express-rate-limit
```

### Key differences:
- **~18 dependencies** instead of ~100
- **4 UI components** instead of 48
- **Game logic as pure functions** that can be tested without React
- **One source of truth** for types, categories, and topic data
- **No mock/fallback AI data in client code** — server handles fallback
- **No localStorage bridges** — data flows through function arguments
- **No console.log** — use a logger with levels
- **Database or nothing** — don't ship both MemStorage and Drizzle schemas

---

## Summary of Priorities

| Priority | Issue | Impact |
|----------|-------|--------|
| 1 | Remove ~80 unused dependencies | Bundle size, install time, security surface |
| 2 | Delete 44 unused UI components | Dead code, maintenance burden |
| 3 | Extract aiService.ts data into JSON/config | 1,092 -> ~100 lines of actual logic |
| 4 | Split god store into focused stores | Testability, readability |
| 5 | Single type definitions | Prevent type drift bugs |
| 6 | Add test infrastructure | Confidence in math validation, AI behavior, grid gen |
| 7 | Wire up Postgres OR delete Drizzle | Remove the half-implemented abstraction |
| 8 | Strip console.log statements | Production hygiene |
| 9 | Remove duplicate category/normalization code | DRY, single source of truth |
| 10 | Extract GameBoard2D inline logic | Component readability |
