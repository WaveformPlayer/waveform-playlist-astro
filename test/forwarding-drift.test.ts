/**
 * test/forwarding-drift.test.ts
 * -----------------------------
 *
 * Forwarding-drift guard. The props type inherits every option from the
 * two cores, but the `Astro.props` destructure and the `data-*` emitters
 * are hand-written — so an option a core adds typechecks here and emits
 * nothing unless someone wires it. That is exactly how `crossOrigin`,
 * `waveformGradient`, `seekHandle`, `buttonSize`, `buttonRadius` and
 * `artworkPosition` went missing.
 *
 * Every key of `WaveformPlaylistOptions` and `WaveformPlayerOptions` (read
 * from the installed cores' `index.d.ts`, see `option-surface.ts`) must
 * either emit its kebab-case `data-*` attribute on the container or be
 * listed in `NOT_FORWARDED` with the reason. Adding an option to a core
 * without deciding which fails this file.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import WaveformPlaylistRaw from '../src/WaveformPlaylist.astro';
import { ALL_OPTIONS, PLAYER_OPTIONS, PLAYLIST_OPTIONS, isCallback } from './option-surface';

const WaveformPlaylist = WaveformPlaylistRaw as Parameters<
	AstroContainer['renderToString']
>[0];

/**
 * Options deliberately NOT emitted on the container. `layout` is absent on
 * purpose: it exists on both surfaces and the playlist's own `layout` is
 * the one emitted (`data-layout`), which the playlist keeps from its
 * embedded player.
 */
const NOT_FORWARDED: Record<string, string> = {
	// Per-track content — rendered on each [data-track] from `tracks`; the
	// playlist strips any container-level copy.
	url: "per-track: the track element's data-url",
	src: 'alias of url; per-track',
	title: 'per-track: data-title',
	artist: 'per-track: data-artist',
	artwork: 'per-track: data-artwork',
	album: 'per-track: data-album',
	markers: 'per-track: data-markers',
	waveform: 'per-track: data-waveform',
	// Aliases / collisions.
	style: "alias of waveformStyle; `style` is the container's HTML inline style here",
	// Owned by the playlist.
	audioMode: 'the playlist always owns its audio (and strips data-audio-mode)',
	// Callbacks: server-rendered static HTML has nothing to attach a
	// function to. Consumers use the player's DOM events instead.
	...Object.fromEntries(
		ALL_OPTIONS.filter(isCallback).map((key) => [key, 'callback: no runtime in static HTML'])
	),
};

const FORWARDED = ALL_OPTIONS.filter((key) => !(key in NOT_FORWARDED));

/**
 * One value per pass, applied to every key at once: each emitter accepts
 * at least one of these (setBool → boolean, setNum → number, colorPreset →
 * 'dark', playbackRates → non-empty array, setStr → any string).
 */
const CANDIDATES: unknown[] = [true, 1, 'dark', ['#fff'], 'x'];

/** camelCase option → the data-* attribute the core parser reads. */
const attrFor = (key: string): string =>
	key === 'showBPM'
		? 'data-show-bpm' // the core reads dataset.showBpm, not data-show-b-p-m
		: `data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

let container: AstroContainer;

beforeAll(async () => {
	container = await AstroContainer.create();
});

/** The container's opening tag for the given props. */
async function containerTag(props: Record<string, unknown>): Promise<string> {
	const html = await container.renderToString(WaveformPlaylist, { props });
	const start = html.indexOf('<div');
	return html.slice(start, html.indexOf('>', start) + 1);
}

describe('forwarding drift', () => {
	it('reads a plausible option surface from both cores', () => {
		expect(PLAYER_OPTIONS.length).toBeGreaterThan(40);
		expect(PLAYER_OPTIONS).toContain('crossOrigin');
		expect(PLAYER_OPTIONS).toContain('onTimeUpdate');
		expect(PLAYLIST_OPTIONS).toContain('continuous');
		expect(PLAYLIST_OPTIONS).toContain('barPosition');
	});

	it('NOT_FORWARDED lists only real options (no stale entries)', () => {
		expect(Object.keys(NOT_FORWARDED).filter((key) => !ALL_OPTIONS.includes(key))).toEqual([]);
	});

	it('emits a data-* attribute for every other option', async () => {
		const tags = await Promise.all(
			CANDIDATES.map((value) =>
				containerTag({
					tracks: [{ url: '/a.mp3' }],
					...Object.fromEntries(FORWARDED.map((key) => [key, value])),
				})
			)
		);

		const dropped = FORWARDED.filter(
			(key) => !tags.some((tag) => new RegExp(`\\s${attrFor(key)}="`).test(tag))
		);
		expect(dropped, 'options neither emitted nor in NOT_FORWARDED').toEqual([]);
	});
});
