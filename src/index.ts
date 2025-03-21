/**
 * Represents a parsing context for processing text input.
 */
class ParseContext {
	/** The source string being parsed */
	src: string;
	/** The current position in the source string */
	pos: number;

	/**
	 * Creates a new ParseContext instance.
	 * @param src - The source string to parse
	 */
	constructor(src: string, pos: number = 0) {
		this.src = src;
		this.pos = pos;
	}

	/**
	 * Checks if there are remaining characters to parse.
	 * @returns true if there are more characters, false otherwise
	 */
	hasRemaining(): boolean {
		return this.pos < this.src.length;
	}

	/**
	 * Returns the remaining unparsed portion of the source string.
	 * @returns The substring from the current position to the end
	 */
	remaining(): string {
		return this.src.slice(this.pos);
	}

	/**
	 * Creates a new ParseContext instance with the remaining unparsed text.
	 * @returns A new ParseContext starting from the current position
	 */
	cloneRemaining(): ParseContext {
		return new ParseContext(this.remaining());
	}

	clone(): ParseContext {
		return new ParseContext(this.src, this.pos);
	}

	/**
	 * Looks ahead in the source string without advancing the position.
	 * @param length - The number of characters to peek
	 * @returns The substring of the specified length starting at the current position
	 */
	peek(length: number): string {
		return this.src.slice(this.pos, this.pos + length);
	}

	/**
	 * Advances the current position in the source string.
	 * @param length - The number of characters to advance
	 */
	step(length: number): void {
		this.pos += length;
	}

	/**
	 * Attempts to match the next portion of the source string against an expected pattern.
	 * @param expect - A string, RegExp, or array of string/RegExp to match against
	 * @param map - Optional function to transform the matched string
	 * @returns The matched string, transformed result, or array of matches if successful; null if no match
	 */
	expect(expect: string | RegExp): string | null;
	expect<T>(expect: string | RegExp, map: (s: string) => T): T | null;
	expect(expect: (string | RegExp)[]): string[] | null;
	expect<T>(
		expect: string | RegExp | (string | RegExp)[],
		map?: (s: string) => T,
	): string | T | string[] | null {
		if (typeof expect === 'string') {
			if (this.peek(expect.length) === expect) {
				this.step(expect.length);
				return map ? map(expect) : expect;
			}
		} else if (expect instanceof RegExp) {
			const match = this.remaining().match(expect);
			if (match !== null) {
				this.step(match[0].length);
				return map ? map(match[0]) : match[0];
			}
		} else if (Array.isArray(expect)) {
			const matches: string[] = [];
			const ctx = this.cloneRemaining();
			for (const e of expect) {
				const match = ctx.expect(e);
				if (match === null) {
					return null;
				}
				matches.push(match);
			}
			this.step(ctx.pos);
			return matches;
		}
		return null;
	}

	/**
	 * Skip whitespaces including \n
	 */
	skipWhitespace(): void {
		this.expect(/^\s*/m);
	}
}

/**
 * Custom error class for SRT syntax errors.
 */
export class SrtSyntaxError extends Error {
	ctx: ParseContext;

	/**
	 * Creates a new SrtSyntaxError instance.
	 * @param info - Error description
	 * @param ctx - The parsing context where the error occurred
	 */
	constructor(info: string, ctx: ParseContext) {
		super(info);
		this.ctx = ctx.clone();
		this.name = 'SrtSyntaxError';
		this.message = `${info}\n${this.format()}`;
	}

	/**
	 * Formats the error message with context information.
	 * @returns A formatted error message string
	 */
	format(): string {
		let result = '';

		const lines = this.ctx.src.split('\n');
		let lineId = 0;
		let accumulatedLength = 0;
		for (const [i, line] of lines.entries()) {
			lineId = i;
			if (accumulatedLength + line.length > this.ctx.pos) {
				// Found the line containing the error position
				break;
			}
			// line length and 1 for '\n'
			accumulatedLength += line.length + 1;
		}
		const currentLine = lines[lineId];
		const posInLine = this.ctx.pos - accumulatedLength;

		result += currentLine + '\n';
		result += ' '.repeat(posInLine) + '^' + '\n';

		return result;
	}
}

/**
 * Represents a single subtitle node in a SubRip text file.
 */
export class SrtNode {
	/**
	 * Identifier of this node.
	 *
	 * When multiple nodes appear at the same time, they will be sorted by their id.
	 */
	id: number;

	/**
	 * Start time in milliseconds
	 */
	appear: number;
	/**
	 * End time in ms
	 */
	disappear: number;

	/**
	 * Subtitle text
	 */
	subtitle: string;

	constructor(
		id: number = 0,
		appear: number = 0,
		disappear: number = 0,
		subtitle: string = '',
	) {
		this.id = id;
		this.appear = appear;
		this.disappear = disappear;
		this.subtitle = subtitle;
	}

	/**
	 * Converts the SrtNode to its string representation.
	 * @returns A string in SubRip text format for this subtitle node.
	 * @example
	 * ```srt
	 * 1
	 * 00:03:20,476 --> 00:03:22,671
	 * There was no danger at all.
	 * ```
	 */
	toString(): string {
		const appearStr = SubRipText.stringifyTimeInMs(this.appear);
		const disappearStr = SubRipText.stringifyTimeInMs(this.disappear);
		return `${this.id}\n${appearStr} --> ${disappearStr}\n${this.subtitle}\n`;
	}

	/**
	 * Parses a string or ParseContext to create an SrtNode.
	 * @param src - Either a string containing a single SrtNode or a ParseContext
	 * @returns A new SrtNode instance
	 */
	static parse(str: string): SrtNode;
	static parse(ctx: ParseContext): SrtNode;
	static parse(src: string | ParseContext): SrtNode {
		if (typeof src === 'string') {
			return this.parse(new ParseContext(src));
		}
		const ctx = src;

		const node = new SrtNode();

		ctx.skipWhitespace();
		{
			// Identifier
			const match_id = ctx.expect(/\d+/, (x) => parseInt(x));
			if (match_id === null) {
				throw new SrtSyntaxError(`Invalid id`, ctx);
			}
			node.id = match_id;
		}

		ctx.expect(/\s*\n\s*/);

		{
			// `00:02:19,482 --> 00:02:21,609`
			const match_duration = ctx.expect([
				SubRipText.RGX_TIMESTAMP,
				/^\s+--+>\s+/,
				SubRipText.RGX_TIMESTAMP,
			]);
			if (match_duration === null) {
				throw new SrtSyntaxError(`Invalid duration`, ctx);
			}
			const [appearStr, _, disappearStr] = match_duration;
			node.appear = SubRipText.parseTimeInMs(appearStr);
			node.disappear = SubRipText.parseTimeInMs(disappearStr);
		}

		ctx.expect(/\s*\n\s*/);

		{
			// Subtitle
			const lines = [];
			while (true) {
				const line = ctx.expect(/^[^\n]+(?=\n|$)/);
				if (line === null) {
					break;
				}
				lines.push(line);

				ctx.expect(/\n?/);
			}
			node.subtitle = lines.join('\n');
		}

		return node;
	}
}

/**
 * Represents a SubRip text (.srt) file.
 *
 * This class provides methods for parsing, stringifying, and manipulating SubRip subtitle data.
 */
export class SubRipText {
	/**
	 * Regular expression for matching the timestamp format in SubRip text.
	 * Format: hh:mm:ss,mmm
	 * Example: 01:46:13,612
	 */
	static RGX_TIMESTAMP = /^(\d+):(\d+):(\d+),(\d+)/;

	/**
	 * MIME type for SubRip text files.
	 */
	static MIME_TYPE = 'application/x-subrip';

	/**
	 * Converts a time in milliseconds to a SubRip timestamp string.
	 * @param timeInMs - The time in milliseconds to convert.
	 * @returns A string in the format "hh:mm:ss,mmm".
	 */
	static stringifyTimeInMs(timeInMs: number): string {
		const h = Math.floor(timeInMs / 3600000);
		const m = Math.floor((timeInMs % 3600000) / 60000);
		const s = Math.floor((timeInMs % 60000) / 1000);
		const ms = Math.floor(timeInMs % 1000);

		const hh = h.toString().padStart(2, '0');
		const mm = m.toString().padStart(2, '0');
		const ss = s.toString().padStart(2, '0');
		const ms3 = ms.toString().padStart(3, '0');

		return `${hh}:${mm}:${ss},${ms3}`;
	}

	/**
	 * Parses a SubRip timestamp string and converts it to milliseconds.
	 * @param str - The timestamp string to parse (format: "hh:mm:ss,mmm").
	 * @returns The time in milliseconds.
	 * @throws {Error} If the input string is not a valid timestamp format.
	 */
	static parseTimeInMs(str: string): number {
		// hh:mm:ss,mmm
		const matches = str.match(SubRipText.RGX_TIMESTAMP);
		if (matches !== null) {
			const [_, h, m, s, ms] = matches.map((x) => parseInt(x));
			return h * 3600000 + m * 60000 + s * 1000 + ms;
		}
		throw new Error(`Invalid time string: '${str}'`);
	}

	/**
	 * Parses a SubRip text string and creates a SubRipText object.
	 * @param src - The source SubRip text string to parse.
	 * @returns A new SubRipText object containing the parsed subtitle nodes.
	 */
	static parse(src: string): SubRipText {
		const srt = new SubRipText();
		const ctx = new ParseContext(src);
		while (ctx.hasRemaining()) {
			srt.nodes.push(SrtNode.parse(ctx));
			ctx.expect('\n');
			ctx.skipWhitespace();
		}
		return srt;
	}

	/**
	 * An array of SrtNode objects representing the subtitles in this SubRip text.
	 */
	nodes: SrtNode[] = [];

	/**
	 * Converts the SubRipText object to a string representation.
	 * @returns A string containing the full SubRip text content.
	 */
	toString(): string {
		return this.nodes
			.map((x) => `${x.toString()}`)
			.join('\n');
	}
}
