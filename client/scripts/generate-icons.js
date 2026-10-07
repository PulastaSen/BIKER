import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(width, height, isMaskable = false) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each row
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const bgR = 0x09, bgG = 0x09, bgB = 0x09;
  const iconR = 0xff, iconG = 0xf1, iconB = 0x74; // #FFF174
  const accentR = 0xef, accentG = 0x44, accentB = 0x44; // #EF4444

  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 64;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0: None
    for (let x = 0; x < width; x++) {
      // Normalize to 64x64 icon grid
      const nx = (x - cx) / scale;
      const ny = (y - cy) / scale;

      let r = bgR, g = bgG, b = bgB, a = 255;

      // Draw background rounded rect or circle if not maskable
      if (!isMaskable) {
        const cornerR = width * 0.22;
        const dx = Math.abs(x - cx) - (cx - cornerR);
        const dy = Math.abs(y - cy) - (cy - cornerR);
        if (dx > 0 && dy > 0 && (dx * dx + dy * dy > cornerR * cornerR)) {
          a = 0; // Transparent outside rounded corner
        }
      }

      if (a > 0) {
        // Draw Triangle / Chevron icon:
        // Top: (0, -18)
        // Bottom Right: (16, 16)
        // Center Indent: (0, 8)
        // Bottom Left: (-16, 16)
        const inLeftWing = (nx >= -18 && nx <= 0 && ny >= -18 - nx * 2 && ny <= 16 && (ny >= 8 + nx * 0.5));
        const inRightWing = (nx >= 0 && nx <= 18 && ny >= -18 + nx * 2 && ny <= 16 && (ny >= 8 - nx * 0.5));
        
        // Simple bounding polygon check for arrow
        // Top vertex (0, -20), Left ( -18, 18), Center notch (0, 9), Right (18, 18)
        const insideArrow = (
          ny >= -20 &&
          ny <= 18 &&
          Math.abs(nx) <= (ny + 20) * 0.55 &&
          !(ny > 9 && Math.abs(nx) < (ny - 9) * 1.5)
        );

        if (insideArrow) {
          r = iconR;
          g = iconG;
          b = iconB;
        }

        // Center dot
        const distCenter = Math.hypot(nx, ny - 3);
        if (distCenter <= 3.5) {
          r = bgR;
          g = bgG;
          b = bgB;
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve(__dirname, '../public');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
fs.writeFileSync(path.join(outDir, 'maskable-icon-512x512.png'), generatePng(512, 512, true));

console.log('PWA icons successfully generated in client/public!');
