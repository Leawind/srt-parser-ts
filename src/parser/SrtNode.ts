import { stringifyMsToTime } from '../utils/index.ts';

/**
 * Represents a single subtitle node in a SubRip text file.
 */
export class SrtNode {
	public constructor(
		/**
		 * Identifier of this node.
		 *
		 * When multiple nodes appear at the same time, they will be sorted by their id.
		 */
		public id: number = 0,
		/**
		 * Start time in milliseconds
		 */
		public appear: number = 0,
		/**
		 * End time in ms
		 */
		public disappear: number = 0,
		/**
		 * Subtitle text
		 */
		public subtitle: string = '',
	) {}

	/**
	 * Converts the SrtNode to its string representation.
	 * @returns A string in SubRip text format for this subtitle node.
	 *
	 * ### Example:
	 *
	 * ```srt
	 * 1
	 * 00:03:20,476 --> 00:03:22,671
	 * There was no danger at all.
	 * ```
	 */
	public toString(): string {
		const appearStr = stringifyMsToTime(this.appear);
		const disappearStr = stringifyMsToTime(this.disappear);
		return `${this.id}\n${appearStr} --> ${disappearStr}\n${this.subtitle}\n`;
	}
}
