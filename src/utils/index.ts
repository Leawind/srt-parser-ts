import { RGX_TIMESTAMP } from '../constants.ts';

/**
 * Converts a time in milliseconds to a SubRip timestamp string.
 * @param timeInMs - The time in milliseconds to convert.
 * @returns A string in the format "hh:mm:ss,mmm".
 */
export function stringifyMsToTime(timeInMs: number): string {
	// Handle negative values
	const isNegative = timeInMs < 0;
	const absTimeInMs = Math.abs(timeInMs);

	const hh = Math.floor(absTimeInMs / 3600000)
		.toString()
		.padStart(2, '0');
	const mm = Math.floor((absTimeInMs % 3600000) / 60000)
		.toString()
		.padStart(2, '0');
	const ss = Math.floor((absTimeInMs % 60000) / 1000)
		.toString()
		.padStart(2, '0');
	const mmm = Math.floor(absTimeInMs % 1000)
		.toString()
		.padStart(3, '0');

	return `${isNegative ? '-' : ''}${hh}:${mm}:${ss},${mmm}`;
}

/**
 * Parses a SubRip timestamp string and converts it to milliseconds.
 *
 * Based on RGX_TIMESTAMP format: /^(\d+)(:(\d+))+((,|\.)(\d+))?$/
 * Supports formats like:
 * - `dd:hh:mm:ss,mmm` (e.g., `12:01:46:13,612`)
 * - `hh:mm:ss.mmm` (e.g., `01:46:13.612`)
 * - `hh:mm:ss,mmm` (e.g., `01:46:13,612`)
 * - `hh:mm:ss` (e.g., `01:46:13`)
 * - `mm:ss,mmm` (e.g., `03:42,567`)
 * - `mm:ss` (e.g., `03:42`)
 * - `ss,mmm` (e.g., `42,567`)
 * - `hh:mm` (e.g., `01:46`)
 *
 * @param str - The timestamp string to parse.
 * @returns The time in milliseconds.
 * @throws {Error} If the input string is not a valid timestamp format.
 */
export function parseTimeToMs(str: string): number {
	str = str.replace(/\s/, '');

	const match = RGX_TIMESTAMP.exec(str);
	if (!match) {
		throw new Error(`Invalid time string: '${str}'`);
	}

	// ['-12:34:56:78:90.12345', '-', '12:34:56:78:90', ':90', '.12345', '.', '12345', index: 0, input: '-12:34:56:78:90.12345', groups: undefined]
	const [_0, sign, cols, _3, _4, _5, mmm] = match;

	// hh:mm:ss
	const parts = cols.split(':').map((x) => parseInt(x)).slice(-4);

	while (parts.length < 4) {
		parts.unshift(0);
	}

	let totalMs = 0;

	totalMs += parts[0] * 86400000;
	totalMs += parts[1] * 3600000;
	totalMs += parts[2] * 60000;
	totalMs += parts[3] * 1000;
	totalMs += ~~mmm;

	return sign === '-' ? -totalMs : totalMs;
}
