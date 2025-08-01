export class StringWalker {
	/**
	 * Creates a new StringWalker instance.
	 */
	public constructor(
		/** The source string being parsed */
		public readonly source: string,
		/** The current position in the source string */
		protected pos: number = 0,
	) {}

	public getPosition(): number {
		return this.pos;
	}

	/**
	 * Checks if there are remaining characters to parse.
	 * @returns true if there are more characters, false otherwise
	 */
	public hasRemaining(): boolean {
		return this.pos < this.source.length;
	}

	/**
	 * Returns the remaining unparsed portion of the source string.
	 * @returns The substring from the current position to the end
	 */
	public remaining(): string {
		return this.source.slice(this.pos);
	}

	/**
	 * Creates a new StringWalker instance with the remaining unparsed text.
	 * @returns A new StringWalker starting from the current position
	 */
	public cloneRemaining(): StringWalker {
		return new StringWalker(this.remaining());
	}

	public clone(): StringWalker {
		return new StringWalker(this.source, this.pos);
	}

	/**
	 * Looks ahead in the source string without advancing the position.
	 * @param length - The number of characters to peek
	 * @returns The substring of the specified length starting at the current position
	 */
	public peek(length: number): string {
		return this.source.slice(this.pos, this.pos + length);
	}

	/**
	 * Advances the current position in the source string.
	 * @param length - The number of characters to advance
	 */
	public advance(length: number): void {
		this.pos += length;
	}

	/**
	 * Attempts to match the next portion of the source string against an expected pattern.
	 * @param expect - A string, RegExp, or array of string/RegExp to match against
	 * @param map - Optional function to transform the matched string
	 * @returns The matched string, transformed result, or array of matches if successful; null if no match
	 */
	public expect(expect: string | RegExp): string | null;
	public expect<T>(expect: string | RegExp, map: (s: string) => T): T | null;
	public expect(expect: (string | RegExp)[]): string[] | null;
	public expect<T>(
		expect: string | RegExp | (string | RegExp)[],
		map?: (s: string) => T,
	): string | T | string[] | null {
		if (typeof expect === 'string') {
			if (this.peek(expect.length) === expect) {
				this.advance(expect.length);
				return map ? map(expect) : expect;
			}
		} else if (expect instanceof RegExp) {
			const match = this.remaining().match(expect);
			if (match !== null) {
				this.advance(match[0].length);
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
			this.advance(ctx.pos);
			return matches;
		}
		return null;
	}

	/**
	 * Skip whitespaces including \n
	 */
	protected skipWhitespace(): void {
		this.expect(/^\s*/m);
	}
}
