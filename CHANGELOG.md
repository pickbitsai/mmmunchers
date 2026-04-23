# Changelog

All notable changes to mmmunchers are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]

### Added
- Five game modes: Classic, Time Attack, Trog Attack, Zen, Streak
- Seven new topics: Science, History, Geography, Animals, Dinosaurs, Music, Surfing (bringing the total to 11)
- Dual 2D/3D rendering with a runtime toggle
- Beach environment and ocean scene for 3D mode

### Changed
- Major refactor: removed the Express backend, AI topic generation service, and the half-wired Postgres/Drizzle schema. The app is now a pure static client-side build.
- Slimmed the dependency tree to only what the game actually uses
- Rewrote topic selection with per-topic category filters

### Removed
- Express server and all `/api/*` endpoints
- OpenAI integration and client-side AI service
- 40+ unused UI component scaffolds and associated packages

## [1.0.0]

### Added
- Initial release
- 3D game environment built with React Three Fiber
- Four topics: Math, Words, Marvel, Movies
- Progressive difficulty with level-based scaling
- Three enemy types (basic, fast, smart) with distinct AI
- Desktop and mobile controls with haptic feedback
- Background music and sound effects with mute toggle
