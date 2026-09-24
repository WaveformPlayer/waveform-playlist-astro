/**
 * test/peer-ranges.test.ts
 * ------------------------
 *
 * The peer floors are load-bearing, not cosmetic. This wrapper emits
 * attributes only `@arraypress/waveform-playlist@1.8.0` reads: per-track
 * `data-waveform`, and a bare/`"true"` boolean rule for `data-continuous`
 * and `data-show-chapter-markers`. Below 1.7.4 the container's
 * `data-layout` also leaked into the embedded player. 1.8.0 in turn needs
 * `@arraypress/waveform-player@1.24.5`.
 */
import { describe, it, expect } from 'vitest';
import pkg from '../package.json';

/** The lowest version a `^x.y.z` range admits, as comparable numbers. */
const floor = (range: string): number[] => {
	const m = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
	if (!m) throw new Error(`expected a ^x.y.z range, got ${range}`);
	return m.slice(1).map(Number);
};
const atLeast = (range: string, min: string): boolean => {
	const [a, b] = [floor(range), floor(`^${min}`)];
	for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
	return true;
};

describe('peer dependency floors', () => {
	it('requires waveform-playlist >= 1.8.0 (the release that reads what this wrapper emits)', () => {
		expect(atLeast(pkg.peerDependencies['@arraypress/waveform-playlist'], '1.8.0')).toBe(true);
	});

	it("requires waveform-player >= 1.24.5 (the playlist core's own floor)", () => {
		expect(atLeast(pkg.peerDependencies['@arraypress/waveform-player'], '1.24.5')).toBe(true);
	});
});
