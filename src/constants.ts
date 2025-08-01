/**
 * MIME type for SubRip text files.
 */
export const MIME_TYPE = 'application/x-subrip';

/**
 * Regular expression for matching the timestamp format in SubRip text.
 * Format: `hh:mm:ss,mmm`
 *
 * Examples:
 * - `01:46:13.612`
 * - `-00:00:01,000`
 * - `01:02:01`
 * - `01:01`
 */
export const RGX_TIMESTAMP = /^(-|\+|)(\d+(:\d+)+)((,|\.)(\d+))?/;
