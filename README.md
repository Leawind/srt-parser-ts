# SubRip Text (SRT) Parser

[![GitHub License](https://img.shields.io/github/license/Leawind/srt-parser-ts)](https://github.com/LEAWIND/srt-parser-ts)
[![JSR Version](https://jsr.io/badges/@leawind/srt-parser)](https://jsr.io/@leawind/srt-parser)
[![deno score](https://jsr.io/badges/@leawind/srt-parser/score)](https://jsr.io/@leawind/srt-parser/doc)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Leawind/srt-parser-ts/deno-test.yaml?branch=main&logo=github-actions&label=test)](https://github.com/Leawind/srt-parser-ts/actions/workflows/deno-test.yaml)

A parser for reading and manipulating [SubRip Text (SRT)](https://en.wikipedia.org/wiki/SubRip) format.

## Features

- Parse SRT files into structured data.
- Manipulate subtitle nodes.
- Convert subtitle data back into SRT format.
- Find subtitles that should be displayed at a specific time.
- Shift subtitle timing by a specified offset.
- Support for negative time values.
- Support for multiple time formats (`hh:mm:ss,mmm`, `hh:mm:ss.mmm`, `mm:ss,mmm`, `mm:ss`, `hh:mm:ss`).

## Usage

For example, we have a SRT file `example.srt` with the following content:

```srt
1
00:00:01,000 --> 00:00:04,000
Hello, world!
```

We can write a script to read the SRT file and manipulate the subtitle nodes:

```typescript
import { type SrtNode, SubRipText } from '@leawind/srt-parser';

// Reformat SRT content
const reformatted: string = SubRipText.reformatFile('example.srt');

// Load SRT from file
const srt: SubRipText = SubRipText.fromFile('./example.srt');

// Manipulate subtitles
srt.shiftTime(1000); // Shift by 1 second
const nodes: SrtNode[] = srt.getNodesAt(3000); // Find all subtitles nodes at 3 seconds
```
