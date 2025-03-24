# SubRip Text (SRT) Parser

[![GitHub License](https://img.shields.io/github/license/Leawind/srt-parser-ts)](https://github.com/LEAWIND/srt-parser-ts)
[![JSR Version](https://jsr.io/badges/@leawind/srt-parser)](https://jsr.io/@leawind/srt-parser)
[![deno score](https://jsr.io/badges/@leawind/srt-parser/score)](https://jsr.io/@leawind/srt-parser/doc)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Leawind/srt-parser-ts/deno-test.yaml?branch=main&logo=github-actions&label=test)](https://github.com/Leawind/srt-parser-ts/actions/workflows/deno-test.yaml)

This project provides a parser for SubRip Text (SRT) files, which are commonly used for subtitles. The parser can read, manipulate, and write SRT files.

## Features

-   Parse SRT files into structured data.
-   Manipulate subtitle nodes.
-   Convert subtitle data back into SRT format.

## Usage

### Parsing an SRT File

You can parse an SRT file using the `SubRipText.parse` method:

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
const srt = SubRipText.parse(srtContent);

// Access subtitle nodes
srt.nodes.forEach(node => {
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

### Error Handling

The parser provides detailed error messages when encountering invalid SRT content:

```typescript
import { SrtSyntaxError, SubRipText } from '@leawind/srt-parser';

try {
	const srt = SubRipText.parse('Invalid SRT content');
} catch (error) {
	if (error instanceof SrtSyntaxError) {
		console.error('Syntax error:', error.message);
	} else {
		console.error('Unexpected error:', error);
	}
}
```
