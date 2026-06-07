const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Generate a minimal valid PNG for the OWUUU icon (yellow rounded rect with black O)
function createPNG(size) {
  // Create raw RGBA pixel data
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const outerR = size / 2;
  const innerR = size * 0.3;
  const ringR = size * 0.5;
  const cornerR = size * 0.25;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Rounded rectangle check
      const inRect = isInRoundedRect(x, y, size, size, cornerR);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const inOuterCircle = dist <= outerR * 0.8;
      const inInnerCircle = dist <= innerR;
      const inRing = dist >= innerR && dist <= ringR;

      if (!inRect) {
        // Transparent
        pixels[idx] = 0; pixels[idx+1] = 0; pixels[idx+2] = 0; pixels[idx+3] = 0;
      } else if (inInnerCircle) {
        // Yellow center
        pixels[idx] = 244; pixels[idx+1] = 196; pixels[idx+2] = 48; pixels[idx+3] = 255;
      } else if (inRing) {
        // Black ring
        pixels[idx] = 0; pixels[idx+1] = 0; pixels[idx+2] = 0; pixels[idx+3] = 255;
      } else {
        // Yellow background
        pixels[idx] = 244; pixels[idx+1] = 196; pixels[idx+2] = 48; pixels[idx+3] = 255;
      }
    }
  }

  return encodePNG(pixels, size, size);
}

function isInRoundedRect(x, y, w, h, r) {
  // Check if point is inside a rounded rectangle
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  // Corners
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
  // Build PNG file manually
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk - raw pixel data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // no filter
    pixels.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
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

// Generate all favicon sizes
const publicDir = path.join(__dirname, '..', 'public');
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'owuuu-icon.png', size: 180 },      // apple-touch-icon
  { name: 'owuuu-icon-192.png', size: 192 },   // android-chrome
  { name: 'owuuu-icon-512.png', size: 512 },   // android-chrome
];

for (const { name, size } of sizes) {
  const png = createPNG(size);
  fs.writeFileSync(path.join(publicDir, name), png);
  console.log(`Generated ${name} (${size}x${size}, ${png.length} bytes)`);
}

console.log('Done!');
