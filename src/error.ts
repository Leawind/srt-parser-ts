import type { StringWalker } from './utils/StringWalker.ts';

/**
 * Custom error class for SRT syntax errors.
 */
export class SrtSyntaxError extends Error {
	protected walker: StringWalker;

	/**
	 * Creates a new SrtSyntaxError instance.
	 * @param info - Error description
	 * @param ctx - The parsing context where the error occurred
	 */
	public constructor(info: string, ctx: StringWalker) {
		super(info);
		this.walker = ctx.clone();
		this.name = 'SrtSyntaxError';
		this.message = `${info}\n${this.format()}`;
	}

	/**
	 * Formats the error message with context information.
	 * @returns A formatted error message string
	 */
	public format(): string {
		let result = '';

		const lines = this.walker.source.split('\n');
		let lineId = 0;
		let accumulatedLength = 0;
		for (const [i, line] of lines.entries()) {
			lineId = i;
			if (accumulatedLength + line.length > this.walker.getPosition()) {
				// Found the line containing the error position
				break;
			}
			// line length and 1 for '\n'
			accumulatedLength += line.length + 1;
		}
		const currentLine = lines[lineId];
		const posInLine = this.walker.getPosition() - accumulatedLength;

		result += currentLine + '\n';
		result += ' '.repeat(posInLine) + '^' + '\n';

		return result;
	}
}
