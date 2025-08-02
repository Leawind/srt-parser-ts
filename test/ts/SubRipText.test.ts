import {
	assert,
	assertAlmostEquals,
	assertStrictEquals,
	assertThrows,
} from '@std/assert';
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

Deno.test('should map time with empty mapping', () => {
	const srt = new SubRipText();
	const node = new SrtNode(1, 1000, 2000, 'Subtitle');
	srt.nodes.push(node);

	// Map time with empty mapping - should not change anything
	srt.mapTime({});

	assertStrictEquals(node.appear, 1000);
	assertStrictEquals(node.disappear, 2000);
});

Deno.test('should map time with single mapping point', () => {
	const srt = new SubRipText();
	const node = new SrtNode(1, 1000, 2000, 'Subtitle');
	srt.nodes.push(node);

	// Map time with single point: 3000ms -> 5000ms
	srt.mapTime({ 3000: 5000 });

	// With single mapping point, all times are shifted by the same offset
	// Offset: 5000 - 3000 = 2000ms
	assertStrictEquals(node.appear, 3000); // 1000 + 2000
	assertStrictEquals(node.disappear, 4000); // 2000 + 2000
});

Deno.test('should map time with simple linear mapping', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 1000, 2000, 'First subtitle');
	const node2 = new SrtNode(2, 3000, 4000, 'Second subtitle');
	srt.nodes.push(node1, node2);

	// A simple shift of +1000ms
	srt.mapTime({ 0: 1000, 5000: 6000 });

	assertStrictEquals(node1.appear, 2000); // 1000 + 1000
	assertStrictEquals(node1.disappear, 3000); // 2000 + 1000
	assertStrictEquals(node2.appear, 4000); // 3000 + 1000
	assertStrictEquals(node2.disappear, 5000); // 4000 + 1000
});

Deno.test('should map time with complex mapping', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 1000, 2000, 'First subtitle');
	const node2 = new SrtNode(2, 3000, 4000, 'Second subtitle');
	const node3 = new SrtNode(3, 5000, 6000, 'Third subtitle');
	const node4 = new SrtNode(4, 9000, 12000, 'Third subtitle');
	srt.nodes.push(node1, node2, node3, node4);

	// Map time with complex transformation:
	// 0ms -> 0ms, 3000ms -> 4000ms, 6000ms -> 12000ms
	srt.mapTime({
		0: 0,
		3000: 4000,
		6000: 12000,
	});

	// Node1: appear at 1000ms -> ~1333ms, disappear at 2000ms -> ~2667ms
	assertAlmostEquals(node1.appear, 1333, 1);
	assertAlmostEquals(node1.disappear, 2667, 1);

	// Node2: appear at 3000ms -> 4000ms, disappear at 4000ms -> ~6667ms
	assertAlmostEquals(node2.appear, 4000, 1);
	assertAlmostEquals(node2.disappear, 6667, 1);

	// Node3: appear at 5000ms -> ~9333ms, disappear at 6000ms -> 12000ms
	assertAlmostEquals(node3.appear, 9333, 1);
	assertAlmostEquals(node3.disappear, 12000, 1);

	// Node4: appear at 9000ms -> ~11667ms, disappear at 12000ms -> 16000ms
	assertAlmostEquals(node4.appear, 20000, 1);
	assertAlmostEquals(node4.disappear, 28000, 1);
});

Deno.test('should map time with string format', () => {
	const srt = new SubRipText();
	const node1 = new SrtNode(1, 1000, 2000, 'First subtitle');
	const node2 = new SrtNode(2, 3000, 4000, 'Second subtitle');
	srt.nodes.push(node1, node2);

	// Map time using string format
	srt.mapTime({
		'00:00:01,000': '00:00:02,000', // 1000ms -> 2000ms
		'00:00:04,000': '00:00:05,000', // 4000ms -> 5000ms
	});

	// Linear interpolation:
	// Node1: appear at 1000ms -> 2000ms, disappear at 2000ms -> 3000ms
	assertStrictEquals(node1.appear, 2000);
	assertStrictEquals(node1.disappear, 3000);

	// Node2: appear at 3000ms -> 4000ms, disappear at 4000ms -> 5000ms
	assertStrictEquals(node2.appear, 4000);
	assertStrictEquals(node2.disappear, 5000);
});
