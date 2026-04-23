# Contributing to mmmunchers

Thanks for your interest! This is a small open-source project — pull requests, bug reports, and ideas for new topics or modes are all welcome.

## Getting set up

```bash
git clone https://github.com/pickbitsai/mmmunchers.git
cd mmmunchers
npm install
npm run dev
```

Open http://localhost:3000.

Run `npm run check` before submitting a PR to make sure TypeScript is clean.

## Project layout

See the [README](README.md#project-layout) for the directory tour. The important bits:

- `client/src/lib/topics/` — one file per educational topic
- `client/src/lib/stores/useGameState.tsx` — game state, phase transitions, topic registry
- `client/src/lib/gameLogic.ts` — enemy AI, collision, timer
- `client/src/components/GameBoard.tsx` / `GameBoard2D.tsx` — 3D and 2D renderers

## Adding a topic

1. Create a class in `client/src/lib/topics/` that extends `TopicProvider`
2. Implement at minimum `getName()`, `generateChallenge(level)`, and `generateGrid(width, height, challenge)`
3. Optionally implement `getCategories()` and `setCategory()` for category filtering
4. Register the topic in `TOPIC_MAP` in `useGameState.tsx`
5. Add a card for it in `TopicSelection.tsx`

Keep content age-appropriate (roughly elementary through middle school) and factually accurate. Progressive difficulty is nice — harder levels should feel harder.

## Adding a game mode

1. Extend the `GameMode` union in `useGameState.tsx`
2. Add defaults to `getModeSettings()`
3. Add a card in `ModeSelection.tsx`
4. Add any mode-specific HUD in `GameUI.tsx`
5. Wire behavior into `munchCurrentCell()` / `gameLogic.ts`

## Style

- TypeScript, functional React components, hooks
- TailwindCSS for styling
- Match the surrounding code — no large reformatting passes alongside logic changes
- Keep PRs focused: one feature or one fix per PR is much easier to review

## Pull requests

1. Fork, branch from `main`
2. Make your change with clear commits
3. Run `npm run check` and verify the game still plays in both 2D and 3D modes
4. Open a PR with a short description of what changed and why. Screenshots or a short clip help a lot for visual changes.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
