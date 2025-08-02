import { parseTimeToMs } from '@/utils/index.ts';
import type { SrtNode } from './parser/SrtNode.ts';
import { SrtParser } from './parser/SrtParser.ts';

/**
 * Represents a SubRip text (.srt) file.
 *
 * This class provides methods for parsing, stringifying, and manipulating SubRip subtitle data.
 */
export class SubRipText {
	/**
	 * An array of SrtNode objects representing the subtitles in this SubRip text.
	 */
	public readonly nodes: SrtNode[] = [];

	/**
	 * Get all subtitle nodes that appear at the specified time.
	 *
	 * @param time - The time (in milliseconds) to check for subtitle nodes
	 * @returns An array of SrtNode objects that are visible at the specified time, sorted by ID
	 */
	public getNodesAt(time: number): SrtNode[] {
		return this.nodes.filter((x) => x.appear <= time && x.disappear >= time)
			.sort((a, b) => a.id - b.id);
	}

	/**
	 * Shift all subtitles in this _srt_ by a specified time offset.
	 */
	public shiftTime(timeOffset: string): ThisType<SubRipText>;
	public shiftTime(timeOffset: number): ThisType<SubRipText>;
	public shiftTime(timeOffset: string | number): ThisType<SubRipText> {
		const time = typeof timeOffset === 'string'
			? parseTimeToMs(timeOffset)
			: timeOffset;
		this.nodes.forEach((x) => {
			x.appear += time;
			x.disappear += time;
		});

		return this;
	}

	public mapTime(
		mappings: Record<string | number, string | number>,
	): ThisType<SubRipText> {
		type SortedMappings = (readonly [number, number])[];

		const sortedMappings: SortedMappings = Object.entries(mappings).map(
			(
				[key, value],
			) => [
				/^\d+$/.test(key) ? ~~key : parseTimeToMs(key),
				typeof value === 'number' ? value : parseTimeToMs(value),
			] as const,
		).sort((a, b) => a[0] - b[0]);

		this.nodes.forEach((x) => {
			x.appear = map(x.appear, sortedMappings);
			x.disappear = map(x.disappear, sortedMappings);
		});

		function map(ms: number, mappings: SortedMappings): number {
			switch (mappings.length) {
				case 0:
					return ms;
				case 1:
					return mappings[0][1] + (ms - mappings[0][0]);
				case 2: {
					const [min, max] = mappings;
					return min[1] + (max[1] - min[1]) / (max[0] - min[0]) *
							(ms - min[0]);
				}
				default: {
					let minId = 0;
					let maxId = mappings.length - 1;

					if (ms < mappings[minId][0]) {
						return mappings[minId][1];
					} else if (ms > mappings[maxId][0]) {
						return mappings[maxId][1];
					} else {
						while (maxId - minId > 1) {
							const mid = Math.floor((minId + maxId) / 2);
							if (ms < mappings[mid][0]) {
								maxId = mid;
							} else {
								minId = mid;
							}
						}
						const min = mappings[minId];
						const max = mappings[maxId];
						return min[1] + (max[1] - min[1]) / (max[0] - min[0]) *
								(ms - min[0]);
					}
				}
			}
		}

		return this;
	}

	/**
	 * Save as srt file
	 */
	public saveFile(path: string): void {
		Deno.writeTextFileSync(path, this.toString());
	}

	/**
	 * Convert the SubRipText object to a string representation.
	 * @returns A string containing the full SubRip text content.
	 */
	public toString(): string {
		return this.nodes.map((x) => `${x.toString()}`).join('\n');
	}

	/**
	 * Create a SubRipText instance from a file.
	 *
	 * @param path - The path to the .srt file to read
	 * @returns A new SubRipText instance containing the parsed subtitle data
	 */
	public static fromFile(path: string): SubRipText {
		return this.fromText(Deno.readTextFileSync(path));
	}

	/**
	 * Create a SubRipText instance from a text string.
	 *
	 * @param src - The SubRip text content to parse
	 * @returns A new SubRipText instance containing the parsed subtitle data
	 */
	public static fromText(src: string): SubRipText {
		return new SrtParser(src).parse(new SubRipText());
	}

	/**
	 * Reformat a SubRip file by reading it, parsing it, and writing it back.
	 *
	 * @param path - The path to the .srt file to reformat
	 */
	public static reformatFile(path: string): void {
		Deno.writeTextFileSync(
			path,
			this.reformat(Deno.readTextFileSync(path)),
		);
	}

	/**
	 * Reformat SubRip text by parsing it and converting it back to a string.
	 *
	 * @param source - The SubRip text content to reformat
	 * @returns The reformatted SubRip text content
	 */
	public static reformat(source: string): string {
		return this.fromText(source).toString();
	}
}
