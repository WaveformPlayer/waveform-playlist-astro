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
  players — usually yes (`preload`, `audioMode`, `waveformStyle`, `height` all do).
- Add a test in `test/WaveformPlaylist.test.ts` + a `CHANGELOG.md` entry.

## Known gap
`crossOrigin` shipped across the rest of the family (2026-07-22) but was **never
added to any of the four playlist wrappers**, including this one. Fix it when
next touching this file.

## Cross-repo
One of 15 packages that must change together — load the `waveform-release` skill.
