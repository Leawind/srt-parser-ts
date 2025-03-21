import { assert, assertStrictEquals, assertThrows } from '@std/assert';

import { SrtNode, SrtSyntaxError, SubRipText } from '@/index.ts';
import { TEST_RESOURCES } from './test_resource.ts';

Deno.test('parseTime', () => {
	const str = '01:46:13,612';
	const ms = SubRipText.parseTimeInMs(str);

	assert(ms === 1 * 3600000 + 46 * 60000 + 13 * 1000 + 612);
	assert(str === SubRipText.stringifyTimeInMs(ms));
});

Deno.test('SrtNode', () => {
	const src = `4
00:02:16,612 --> 00:02:19,376
Senator, we're making
our final approach into Coruscant.`;
	const node = SrtNode.parse(src);

	assertStrictEquals(node.id, 4);
	assertStrictEquals(
		node.subtitle,
		`Senator, we're making\nour final approach into Coruscant.`,
	);
});

Deno.test('standard', () => {
	const srt = SubRipText.parse(TEST_RESOURCES.std_srt_file);
	assertStrictEquals(TEST_RESOURCES.std_srt_file, srt.toString());
});

Deno.test('unstandard', () => {
	const srt1 = SubRipText.parse(TEST_RESOURCES.std_srt_file);
	const srt2 = SubRipText.parse(TEST_RESOURCES.unstd_srt_file);

	assertStrictEquals(
		srt1.toString(),
		srt2.toString(),
	);
});

Deno.test('error', () => {
	assertThrows(() => {
		SrtNode.parse('F\n');
	}, SrtSyntaxError);

	assertThrows(() => {
		SrtNode.parse(
			'1\n00:02:16:612 --> 00:02:19,376\nThis line is subtitle.',
		);
	}, SrtSyntaxError);
});

Deno.test('Show Error Message', () => {
	try {
		SrtNode.parse(
			'1\n00:02:16.612 --> 00:02:19,376\nThis line is subtitle.\nAnd this is the second line.\n\n',
		);
	} catch (err) {
		assert(err instanceof SrtSyntaxError);
		console.log(err.toString());
	}
});
