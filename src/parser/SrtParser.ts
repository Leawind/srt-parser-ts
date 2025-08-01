import type { SubRipText } from '@leawind/srt-parser';
import { StringWalker } from '../utils/StringWalker.ts';
import { SrtNode } from './SrtNode.ts';
import { SrtSyntaxError } from '../error.ts';
import { RGX_TIMESTAMP } from '../constants.ts';
import { parseTimeToMs } from '../utils/index.ts';

/**
 * SrtParser class for parsing SubRip text.
 */
export class SrtParser extends StringWalker {
	public constructor(src: string) {
		super(src);
	}

	/**
	 * @returns A new SubRipText object containing the parsed subtitle nodes.
	 */
	public parse(srt: SubRipText): SubRipText {
		while (this.hasRemaining()) {
			srt.nodes.push(this.parseNode());
			this.expect('\n');
			this.skipWhitespace();
		}
		return srt;
	}

	private parseNode(): SrtNode {
		const node = new SrtNode();

		this.skipWhitespace();
		{
			// Identifier
			const match_id = this.expect(/\d+/, (x) => parseInt(x));
			if (match_id === null) {
				throw new SrtSyntaxError(`Invalid id`, this);
			}
			node.id = match_id;
		}

		this.expect(/\s*\n\s*/);

		{
			// Timestamps
			// `hh:mm:ss,mmm --> hh:mm:ss,mmm`
			// `00:02:19,482      ---->   00:02:21,609`
			const match_duration = this.expect([
				RGX_TIMESTAMP,
				/^\s+--+>\s+/,
				RGX_TIMESTAMP,
			]);
			if (match_duration === null) {
				throw new SrtSyntaxError(`Invalid duration`, this);
			}
			const [appearStr, _, disappearStr] = match_duration;
			node.appear = parseTimeToMs(appearStr);
			node.disappear = parseTimeToMs(disappearStr);
		}

		this.expect(/\s*\n\s*/);

		{
			// Subtitle
			const lines = [];
			while (true) {
				const line = this.expect(/^[^\n]+(?=\n|$)/);
				if (line === null) {
					break;
				}
				lines.push(line);

				this.expect(/\n?/);
			}
			node.subtitle = lines.join('\n');
		}

		return node;
	}
}
