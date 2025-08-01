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

	public getNodesAt(time: number): SrtNode[] {
		return this.nodes.filter((x) => x.appear <= time && x.disappear >= time)
			.sort((a, b) => a.id - b.id);
	}

	/**
	 * Shifts all subtitles in this _srt_ by a specified time offset.
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
	 * Converts the SubRipText object to a string representation.
	 * @returns A string containing the full SubRip text content.
	 */
	public toString(): string {
		return this.nodes.map((x) => `${x.toString()}`).join('\n');
	}

	public static fromFile(path: string): SubRipText {
		return this.fromText(Deno.readTextFileSync(path));
	}

	public static fromText(src: string): SubRipText {
		return new SrtParser(src).parse(new SubRipText());
	}

	public static reformatFile(path: string): void {
		Deno.writeTextFileSync(
			path,
			this.reformat(Deno.readTextFileSync(path)),
		);
	}

	public static reformat(source: string): string {
		return this.fromText(source).toString();
	}
}
