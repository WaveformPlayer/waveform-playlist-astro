# Changelog

All notable changes to `@arraypress/waveform-playlist-astro` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Added

- The hero and grid layouts: `layout` now accepts `'hero'` and `'grid'`
  alongside `'list'` / `'minimal'` (it was typed `'list' | 'minimal'`
  although both ship in the core), and their options are typed props,
  emitted as the container attributes the playlist parses:
  `showArtist` (`data-show-artist`), `coverSize` (`data-cover-size`),
  `thumbnailSize` (`data-thumbnail-size`), `density`
  (`'comfortable' | 'compact'`, `data-density`), `coverPosition`
  (`'left' | 'top'`, `data-cover-position`) and `barPosition`
  (`'top' | 'bottom'`, `data-bar-position`). Exported as
  `WaveformPlaylistLayoutProps`. Types come from the playlist core's
  `index.d.ts` (1.8.0 declares them all); against an older core they fall
  back to the same 1.8.0 shapes instead of degrading to `unknown`.
- Per-track `waveform` peaks on `WaveformPlaylistTrackInput`
  (`number[] | string`), rendered as the track's `data-waveform`: an array
  is JSON-encoded (an empty one is omitted), a string (e.g. a `.json`
  peaks URL) emitted verbatim. With peaks the player skips decoding that
  track's audio. Playlist 1.8.0 is the first version that reads
  `data-waveform`.

### Fixed

- `waveformGradient`, `seekHandle`, `buttonSize`, `buttonRadius` and
  `artworkPosition` reach the embedded player, as `data-waveform-gradient`,
  `data-seek-handle`, `data-button-size`, `data-button-radius` and
  `data-artwork-position`. All five are core player options the props type
  inherited, but the component never destructured or emitted them — they
  typechecked and were silently dropped. `buttonRadius={0}` emits `"0"`.

## [0.4.0] — 2026-08-07

### Added

- Forward the core player's `crossOrigin` option to the embedded player.
  Added to the `Astro.props` destructure and emitted as the
  `data-cross-origin` container attribute.
  This option shipped across the rest of the waveform family in
  `@arraypress/waveform-player@1.23.0` but was missed in the playlist
  wrappers, so it was previously accepted by the types and silently
  dropped at runtime. Requires `@arraypress/waveform-player@^1.23.0`
  and `@arraypress/waveform-playlist@^1.7.2` (the version that began
  forwarding it to each track's player).

## [0.3.0] — 2026-07-05

### Added

- Forward the core player's new localizable UI-string options —
  `seekValueText`, `playPauseLabel`, `speedLabel`, `artworkAlt`, and
  `unknownTrackText` — through to the underlying player. Requires
  `@arraypress/waveform-player@^1.20.0`.

## [0.1.0] — Initial release

### Added

- `<WaveformPlaylist>` Astro component wrapping
  `@arraypress/waveform-playlist`. Renders the library's nested markup
  contract — a `[data-waveform-playlist]` container with one
  `[data-track]` child per track and one `[data-chapter]` child per
  chapter — from a single typed `tracks` array.
- Typed props for the playlist's own options:
  - `layout` (`'list' | 'minimal'`), `continuous`, `expandChapters`,
    `showDuration`, `showChapterMarkers` (`boolean | null`),
    `chapterMarkerColor`, `showPlayState`.
- Typed pass-through of the WaveformPlayer options the playlist forwards
  to its embedded player — `waveformStyle`, `height`, `samples`,
  `barWidth`, `barSpacing`, `barRadius`, `colorPreset`, the colour
  options (including gradient-array `waveformColor` / `progressColor`),
  `playbackRate`, `showPlaybackSpeed`, `playbackRates`, `showControls`,
  `showInfo`, `showTime`, `showHoverTime`, `showBPM`, `bpm`,
  `buttonAlign`, `buttonStyle`, `accessibleSeek`, `seekLabel`,
  `errorText`, `showMarkers`, `autoplay`, `singlePlay`, `playOnSeek`,
  `enableMediaSession`, `preload`, `playIcon`, `pauseIcon`. The
  per-track content fields (`url`, `title`, `artist`, `artwork`,
  `album`, `markers`) live on each `tracks` entry instead, and the
  player's `layout` / `audioMode` are intentionally not exposed (the
  playlist owns `data-layout` and always drives a self-mode player).
- A typed `tracks` array (`WaveformPlaylistTrackInput[]`) with per-track
  `url`, `title`, `artist`, `artwork`, `album`, `duration`, `markers`,
  and `chapters` (`{ time, label, color? }`).
- Astro-specific `lazy` prop that switches the init attribute to
  `data-waveform-playlist-lazy` and ships a single deduplicated
  `IntersectionObserver` that promotes the playlist on viewport entry,
  plus a non-lazy `astro:page-load` re-init for Astro View Transitions.
- Astro-specific `id`, `class`, and `style` pass-throughs (`wfpl-host` is
  always applied to the container).
- Public TypeScript types derived from the two core packages so they
  never drift: `WaveformPlaylistProps`, `WaveformPlaylistTrackInput`,
  and re-exports of `WaveformPlaylistOptions` / `WaveformPlaylistTrack` /
  `WaveformPlaylistChapter` / `WaveformPlaylistMarker` (from the playlist
  core) and `WaveformStyle` / `WaveformMarker` / `WaveformPeaks` /
  `ColorPreset` / `AudioMode` / `AudioPreload` / `ButtonAlign` (from the
  player core).
- Vitest suite covering container option serialisation, omission
  semantics, JSON serialisation for array props, per-track and per-chapter
  rendering, lazy-mount and View-Transitions script presence, and the
  Astro extras.
- Documentation: full prop reference, setup guide, and usage examples
  (`examples/basic.astro`).
