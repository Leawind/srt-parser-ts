# SubRip Text (SRT) Parser

[![GitHub License](https://img.shields.io/github/license/Leawind/srt-parser-ts)](https://github.com/LEAWIND/srt-parser-ts)
[![JSR Version](https://jsr.io/badges/@leawind/srt-parser)](https://jsr.io/@leawind/srt-parser)
[![deno score](https://jsr.io/badges/@leawind/srt-parser/score)](https://jsr.io/@leawind/srt-parser/doc)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Leawind/srt-parser-ts/deno-test.yaml?branch=main&logo=github-actions&label=test)](https://github.com/Leawind/srt-parser-ts/actions/workflows/deno-test.yaml)

This project provides a parser for SubRip Text (SRT) files, which are commonly used for subtitles. The parser can read, manipulate, and write SRT files.

## Features

- Parse SRT files into structured data.
- Manipulate subtitle nodes.
- Convert subtitle data back into SRT format.
- Find subtitles that should be displayed at a specific time.
- Shift subtitle timing by a specified offset.
- Support for negative time values.
- Support for multiple time formats (hh:mm:ss,mmm, mm:ss,mmm, mm:ss, hh:mm:ss).

## Usage

### Parsing an SRT File

You can parse an SRT file using the `SubRipText.fromText` method:

```typescript
import { SubRipText } from '@leawind/srt-parser';

// Example SRT content
const srtContent = `
1
00:00:01,000 --> 00:00:04,000
Hello, world!

2
00:00:05,000 --> 00:00:08,000
This is a subtitle example.
`;

// Parse the SRT content
const srt = SubRipText.fromText(srtContent);

// Access subtitle nodes
srt.nodes.forEach((node) => {
	console.log(node.toString());
});
```

You can also parse an SRT file directly from the file system:

```typescript
import { SubRipText } from '@leawind/srt-parser';

// Parse the SRT file
const srt = SubRipText.fromFile('path/to/subtitle.srt');

// Access subtitle nodes
srt.nodes.forEach((node) => {
	console.log(node.toString());
});
```

### Creating and Manipulating Subtitle Nodes

You can create and manipulate subtitle nodes using the `SrtNode` class:

```typescript
import { SrtNode } from '@leawind/srt-parser';

// Create a new subtitle node
const node = new SrtNode(1, 1000, 4000, 'Hello, world!');

// Modify the subtitle text
node.subtitle = 'Hello, universe!';

// Convert the node to SRT format
console.log(node.toString());
```

### Shifting Subtitle Timing

You can shift all subtitles in an SRT file by a specified time offset:

```typescript
import { SubRipText } from '@leawind/srt-parser';

// Parse an SRT file
const srt = SubRipText.fromText(srtContent);

// Shift all subtitles by 1 second (1000ms)
srt.shiftTime(1000);

// Or shift by a time string
srt.shiftTime('00:00:01,000');

// You can also shift with negative values
srt.shiftTime(-500); // Shift backwards by 500ms
srt.shiftTime('-00:00:00,500'); // Shift backwards by 500ms using string format
```

### Reformatting SRT Files

You can reformat SRT files to ensure consistent formatting:

```typescript
import { SubRipText } from '@leawind/srt-parser';

// Reformat an SRT string
const reformatted = SubRipText.reformat(srtContent);

// Or reformat a file directly
SubRipText.reformatFile('path/to/subtitle.srt');
```

### Finding Subtitles at Specific Times

You can find which subtitles should be displayed at a specific time:

```typescript
import { SubRipText } from '@leawind/srt-parser';

// Parse an SRT file
const srt = SubRipText.fromText(srtContent);

// Find subtitles that should be displayed at 3000ms (3 seconds)
const subtitles = srt.getNodesAt(3000);

// subtitles is an array of SrtNode objects that should be displayed at 3000ms
subtitles.forEach((node) => {
	console.log(`Subtitle ID: ${node.id}, Text: ${node.subtitle}`);
});
```

The `getNodesAt` method returns an array of [SrtNode](file:///D:/Workspace/FromGithub/Leawind/srt-parser-ts/src/parser/SrtNode.ts#L5-L44) objects that should be displayed at the specified time (in milliseconds). If multiple subtitles overlap at that time, they will be sorted by their ID.
