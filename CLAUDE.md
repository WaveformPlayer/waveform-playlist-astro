# CLAUDE.md — @arraypress/waveform-playlist-astro

Astro wrapper for `@arraypress/waveform-playlist`. Renders a declarative `tracks`
array into the nested `data-*` markup the playlist's auto-initialiser expects
(`[data-waveform-playlist]` > `[data-track]` > `[data-chapter]`).

## Commands
- `npm test` — vitest. **The only pre-publish gate: no `build`, no `prepublishOnly`** —
  ships `src/` directly.

## The rule that matters: two edits per option, both manual

`src/WaveformPlaylist.astro`. **This follows the player-wrapper pattern, not the
bar's verbatim pass-through** — nothing is forwarded automatically. A new option needs:
1. Add it to the `Astro.props` destructure (~line 193).
2. A `setStr` / `setNum` / `setBool` call (~line 214+) emitting the kebab-case
   `data-*` attribute (`crossOrigin` → `data-cross-origin`).

Miss either and the prop typechecks and is silently dropped.

## Conventions
- Types derive from **both** cores — `waveform-playlist` owns playlist options,
  `waveform-player` owns the visualisation options forwarded to embedded players.
  Never re-declare either surface here.
- Forward a new *player* option only if the playlist should pass it to its embedded
  players — usually yes (`preload`, `waveformStyle`, `height` all do) — never `audioMode`, which the playlist ignores since 1.8.0 (it always owns its audio).
- Add a test in `test/WaveformPlaylist.test.ts` + a `CHANGELOG.md` entry.

## History
`crossOrigin` shipped across the rest of the family in 2026-07 but was missed in
all four playlist wrappers — accepted by the types, silently dropped at runtime.
Fixed in 0.4.0. That miss is why this group is now steps 12–15 of the
`waveform-release` checklist rather than an afterthought.

## Cross-repo
One of 15 packages that must change together — load the `waveform-release` skill.
