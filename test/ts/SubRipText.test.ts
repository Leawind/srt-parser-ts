import { assert, assertStrictEquals, assertThrows } from '@std/assert';
import { SRM } from '../test-utils.ts';
import { SubRipText } from '@/SubRipText.ts';
import { SrtSyntaxError } from '@/error.ts';
import { SrtNode } from '@/parser/SrtNode.ts';

Deno.test('should parse single node srt', async () => {
	const srtText = await SRM.fetch('node.srt');
	SubRipText.fromText(srtText);
});

Deno.test('should parse standard srt', async () => {
	const srtText = await SRM.fetch('std.srt');
	const srt = SubRipText.fromText(srtText);
	assertStrictEquals(srtText, srt.toString());
});

Deno.test('should parse unstandard srt', async () => {
	const srt1 = SubRipText.fromText(await SRM.fetch('std.srt'));
	const srt2 = SubRipText.fromText(await SRM.fetch('unstd.srt'));

	assertStrictEquals(srt1.toString(), srt2.toString());
});

Deno.test('should throw error', () => {
	assertThrows(() => {
		SubRipText.fromText('F\n');
	}, SrtSyntaxError);

	assertThrows(() => {
		SubRipText.fromText(
			'1\nf00:02:16:612 --> 00:02:19,376\nThis line is subtitle.',
		);
	}, SrtSyntaxError);
});

Deno.test('Show Error Message', () => {
	try {
		SubRipText.fromText(
			'1\n00:02:16.612 --> 00:02:19,376\nThis line is subtitle.\nAnd this is the second line.\n\n',
		);
	} catch (err) {
		assert(err instanceof SrtSyntaxError);
		console.log(err.toString());
	}
});

Deno.test('should parse nezha 1 srt file', async () => {
	const s = await SRM.fetch('Nezha1.en.srt');
	SubRipText.fromText(s);
});

Deno.test('should shift time by milliseconds', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 1000, 2000, 'Hello world');
	const node2 = new SrtNode(2, 3000, 4000, 'Hello again');
	srt.nodes.push(node1, node2);

	// Shift by 500ms
	srt.shiftTime(500);

	assertStrictEquals(node1.appear, 1500);
	assertStrictEquals(node1.disappear, 2500);
	assertStrictEquals(node2.appear, 3500);
	assertStrictEquals(node2.disappear, 4500);
});

Deno.test('should shift time by string format', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 1000, 2000, 'Hello world');
	const node2 = new SrtNode(2, 3000, 4000, 'Hello again');
	srt.nodes.push(node1, node2);

	// Shift by 1 second (1000ms)
	srt.shiftTime('00:00:01,000');

	assertStrictEquals(node1.appear, 2000);
	assertStrictEquals(node1.disappear, 3000);
	assertStrictEquals(node2.appear, 4000);
	assertStrictEquals(node2.disappear, 5000);
});

Deno.test('should shift time with negative offset', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 5000, 7000, 'Hello world');
	const node2 = new SrtNode(2, 8000, 10000, 'Hello again');
	srt.nodes.push(node1, node2);

	// Shift by -2 seconds
	srt.shiftTime(-2000);

	assertStrictEquals(node1.appear, 3000);
	assertStrictEquals(node1.disappear, 5000);
	assertStrictEquals(node2.appear, 6000);
	assertStrictEquals(node2.disappear, 8000);
});

Deno.test('should shift time with string format and negative offset', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 5000, 7000, 'Hello world');
	const node2 = new SrtNode(2, 8000, 10000, 'Hello again');
	srt.nodes.push(node1, node2);

	// Shift by -1.5 seconds
	srt.shiftTime('-00:00:01,500');

	assertStrictEquals(node1.appear, 3500);
	assertStrictEquals(node1.disappear, 5500);
	assertStrictEquals(node2.appear, 6500);
	assertStrictEquals(node2.disappear, 8500);
});

Deno.test('should get nodes at specific time', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 1000, 3000, 'First subtitle');
	const node2 = new SrtNode(2, 2000, 4000, 'Second subtitle');
	const node3 = new SrtNode(3, 5000, 7000, 'Third subtitle');
	srt.nodes.push(node1, node2, node3);

	// At 1500ms, only the first subtitle is displayed
	let nodes = srt.getNodesAt(1500);
	assertStrictEquals(nodes.length, 1);
	assertStrictEquals(nodes[0], node1);

	// At 2500ms, both first and second subtitles are displayed
	nodes = srt.getNodesAt(2500);
	assertStrictEquals(nodes.length, 2);
	assertStrictEquals(nodes[0], node1); // Nodes with smaller IDs come first
	assertStrictEquals(nodes[1], node2);

	// At 6000ms, only the third subtitle is displayed
	nodes = srt.getNodesAt(6000);
	assertStrictEquals(nodes.length, 1);
	assertStrictEquals(nodes[0], node3);

	// At 8000ms, no subtitles are displayed
	nodes = srt.getNodesAt(8000);
	assertStrictEquals(nodes.length, 0);
});
