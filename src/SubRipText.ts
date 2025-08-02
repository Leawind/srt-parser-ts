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
	public shiftTime(timeOffset: string): void;
	public shiftTime(timeOffset: number): void;
	public shiftTime(timeOffset: string | number): void {
		const time = typeof timeOffset === 'string'
			? parseTimeToMs(timeOffset)
			: timeOffset;
		this.nodes.forEach((x) => {
			x.appear += time;
			x.disappear += time;
		});
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
