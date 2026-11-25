// Meme Sprint 3: AI Agent Goes Rogue — v2 entry
// Copies the pre-built meme image (meme.png, same directory as this
// file) to $OUTPUT_DIR/entry.png (or /output/entry.png when the env
// var is unset). The image itself is the entry; this program only
// delivers it to the grader's gate.

import { copyFileSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576; // gate cap: 1 MiB
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "meme.png");
const outDir = process.env.OUTPUT_DIR ?? "/output/entry.png";
const target = outDir.endsWith("entry.png") ? outDir : join(outDir, "entry.png");

const { size: srcSize } = statSync(source);
if (srcSize > MAX_BYTES) {
  throw new Error(
    `meme.png is ${srcSize} bytes, over the 1 MiB gate cap (${MAX_BYTES}); refusing to write an invalid entry`,
  );
}

// Validate it is a whole PNG and read its dimensions from the IHDR chunk.
const head = readFileSync(source);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (head.length < 33 || !head.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("meme.png is not a valid PNG file");
}
const width = head.readUInt32BE(16);
const height = head.readUInt32BE(20);
if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
  throw new Error(
    `meme.png is ${width}x${height}, expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}; refusing to write an invalid entry`,
  );
}
console.log(`validated meme.png: PNG ${width}x${height}, ${srcSize} bytes (<= ${MAX_BYTES})`);

copyFileSync(source, target);
const { size } = statSync(target);
console.log(`wrote ${target} (${size} bytes)`);
