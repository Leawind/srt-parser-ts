import { assertStrictEquals, assertThrows } from '@std/assert';
import { parseTimeToMs, stringifyMsToTime } from '@/utils/index.ts';

Deno.test('stringifyMsToTime should convert positive milliseconds to time string', () => {
	assertStrictEquals(stringifyMsToTime(1000), '00:00:01,000');
	assertStrictEquals(stringifyMsToTime(61000), '00:01:01,000');
	assertStrictEquals(stringifyMsToTime(3721000), '01:02:01,000');
});

Deno.test('stringifyMsToTime should convert negative milliseconds to time string', () => {
	assertStrictEquals(stringifyMsToTime(-1000), '-00:00:01,000');
	assertStrictEquals(stringifyMsToTime(-61000), '-00:01:01,000');
	assertStrictEquals(stringifyMsToTime(-3721000), '-01:02:01,000');
});

Deno.test('parseTimeToMs should parse hh:mm:ss,mmm format', () => {
	assertStrictEquals(parseTimeToMs('00:00:01,000'), 1000);
	assertStrictEquals(parseTimeToMs('00:01:01,000'), 61000);
	assertStrictEquals(parseTimeToMs('01:02:01,000'), 3721000);
});
Deno.test('parseTimeToMs should parse hh:mm:ss.mmm format', () => {
	assertStrictEquals(parseTimeToMs('00:00:01.000'), 1000);
	assertStrictEquals(parseTimeToMs('00:01:01.123'), 61123);
	assertStrictEquals(parseTimeToMs('01:02:01.000'), 3721000);
});

Deno.test('parseTimeToMs should parse negative hh:mm:ss,mmm format', () => {
	assertStrictEquals(parseTimeToMs('-00:00:01,000'), -1000);
	assertStrictEquals(parseTimeToMs('-00:01:01,000'), -61000);
	assertStrictEquals(parseTimeToMs('-01:02:01,000'), -3721000);
});

Deno.test('parseTimeToMs should parse mm:ss,mmm format', () => {
	assertStrictEquals(parseTimeToMs('00:01,000'), 1000);
	assertStrictEquals(parseTimeToMs('01:01,000'), 61000);
});

Deno.test('parseTimeToMs should parse negative mm:ss,mmm format', () => {
	assertStrictEquals(parseTimeToMs('-00:01,000'), -1000);
	assertStrictEquals(parseTimeToMs('-01:01,000'), -61000);
});

Deno.test('parseTimeToMs should parse mm:ss format', () => {
	assertStrictEquals(parseTimeToMs('00:01'), 1000);
	assertStrictEquals(parseTimeToMs('01:01'), 61000);
});

Deno.test('parseTimeToMs should parse negative mm:ss format', () => {
	assertStrictEquals(parseTimeToMs('-00:01'), -1000);
	assertStrictEquals(parseTimeToMs('-01:01'), -61000);
});

Deno.test('parseTimeToMs should parse hh:mm:ss format', () => {
	assertStrictEquals(parseTimeToMs('00:00:01'), 1000);
	assertStrictEquals(parseTimeToMs('00:01:01'), 61000);
	assertStrictEquals(parseTimeToMs('01:02:01'), 3721000);
});

Deno.test('parseTimeToMs should parse negative hh:mm:ss format', () => {
	assertStrictEquals(parseTimeToMs('-00:00:01'), -1000);
	assertStrictEquals(parseTimeToMs('-00:01:01'), -61000);
	assertStrictEquals(parseTimeToMs('-01:02:01'), -3721000);
});

Deno.test('parseTimeToMs should throw error for invalid format', () => {
	assertThrows(() => parseTimeToMs('invalid'));
	assertThrows(() => parseTimeToMs('1'));
	assertThrows(() => parseTimeToMs('1:'));
});
