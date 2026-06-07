const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Generate ICO file containing 16x16 and 32x32 PNG images
function createICO(png16, png32) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: ICO
  header.writeUInt16LE(2, 4);      // number of images

  // Directory entry 1: 16x16
  const dir1 = Buffer.alloc(16);
  dir1[0] = 16;   // width
  dir1[1] = 16;   // height
  dir1[2] = 0;    // color palette
  dir1[3] = 0;    // reserved
  dir1.writeUInt16LE(1, 4);  // color planes
  dir1.writeUInt16LE(32, 6); // bits per pixel
  dir1.writeUInt32LE(png16.length, 8);  // size
  dir1.writeUInt32LE(22, 12);           // offset (6 + 16*2 = 38... wait)

  // Actually: header(6) + 2 dirs(16 each) = 38
  dir1.writeUInt32LE(38, 12);

  // Directory entry 2: 32x32
  const dir2 = Buffer.alloc(16);
  dir2[0] = 32;
  dir2[1] = 32;
  dir2[2] = 0;
  dir2[3] = 0;
  dir2.writeUInt16LE(1, 4);
  dir2.writeUInt16LE(32, 6);
  dir2.writeUInt32LE(png32.length, 8);
  dir2.writeUInt32LE(38 + png16.length, 12);

  return Buffer.concat([header, dir1, dir2, png16, png32]);
}

// Recreate the PNG generation (same as gen-favicons.cjs)
function createPNG(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const innerR = size * 0.3;
  const ringR = size * 0.5;
  const cornerR = size * 0.25;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const inRect = isInRoundedRect(x, y, size, size, cornerR);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const inInnerCircle = dist <= innerR;
      const inRing = dist >= innerR && dist <= ringR;

      if (!inRect) {
        pixels[idx] = 0; pixels[idx+1] = 0; pixels[idx+2] = 0; pixels[idx+3] = 0;
      } else if (inInnerCircle) {
        pixels[idx] = 244; pixels[idx+1] = 196; pixels[idx+2] = 48; pixels[idx+3] = 255;
      } else if (inRing) {
        pixels[idx] = 0; pixels[idx+1] = 0; pixels[idx+2] = 0; pixels[idx+3] = 255;
      } else {
        pixels[idx] = 244; pixels[idx+1] = 196; pixels[idx+2] = 48; pixels[idx+3] = 255;
      }
    }
  }
  return encodePNG(pixels, size, size);
}

function isInRoundedRect(x, y, w, h, r) {
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  if (x < r && y < r) return Math.sqrt((x-r)**2 + (y-r)**2) <= r;
  if (x >= w-r && y < r) return Math.sqrt((x-(w-r))**2 + (y-r)**2) <= r;
  if (x < r && y >= h-r) return Math.sqrt((x-r)**2 + (y-(h-r))**2) <= r;
  if (x >= w-r && y >= h-r) return Math.sqrt((x-(w-r))**2 + (y-(h-r))**2) <= r;
  return true;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function encodePNG(pixels, width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    pixels.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBuffer, data, crc]);
}

const png16 = createPNG(16);
const png32 = createPNG(32);
const ico = createICO(png16, png32);

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
console.log(`Generated favicon.ico (${ico.length} bytes)`);
