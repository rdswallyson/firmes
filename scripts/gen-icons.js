/**
 * Gera ícones PNG para PWA usando apenas módulos nativos do Node.js
 * Cria ícones com o logo Pilares do FIRMES
 * Execute: node scripts/gen-icons.js
 */
const fs   = require("fs");
const path = require("path");
const zlib = require("zlib");

// ── helpers PNG ──────────────────────────────────────────────────────────────

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const crc = u32(crc32(Buffer.concat([t, data])));
  return Buffer.concat([u32(data.length), t, data, crc]);
}

/** Cria PNG RGBA a partir de um array flat [r,g,b,a, r,g,b,a ...] */
function makePNG(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk(
    "IHDR",
    Buffer.concat([u32(size), u32(size), Buffer.from([8, 6, 0, 0, 0])])
  ); // bit depth 8, color type 6 = RGBA

  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      row[1 + x * 4]     = pixels[i];
      row[1 + x * 4 + 1] = pixels[i + 1];
      row[1 + x * 4 + 2] = pixels[i + 2];
      row[1 + x * 4 + 3] = pixels[i + 3];
    }
    rows.push(row);
  }
  const idat = chunk("IDAT", zlib.deflateSync(Buffer.concat(rows)));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// ── Desenho do ícone ──────────────────────────────────────────────────────────

const NAVY  = [26,  60, 110, 255]; // #1A3C6E
const GOLD  = [200,146,  42, 255]; // #C8922A
const SILVER= [176,184,200, 255]; // #B0B8C8
const WHITE = [255,255,255, 255];
const TRANS = [0, 0, 0, 0];

function px(pixels, size, x, y, color) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 4;
  pixels[i]   = color[0];
  pixels[i+1] = color[1];
  pixels[i+2] = color[2];
  pixels[i+3] = color[3];
}

function fillRect(pixels, size, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      px(pixels, size, x + dx, y + dy, color);
}

function circle(pixels, size, cx, cy, r, color) {
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r)
        px(pixels, size, cx + dx, cy + dy, color);
}

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4); // transparente

  const s = size / 48; // escala base

  // Fundo arredondado navy
  const r = Math.round(10 * s);
  // fill background com canto arredondado
  fillRect(pixels, size, Math.round(r), 0, size - 2 * r, size, NAVY);
  fillRect(pixels, size, 0, Math.round(r), size, size - 2 * r, NAVY);
  circle(pixels, size, Math.round(r),        Math.round(r),        r, NAVY);
  circle(pixels, size, size - Math.round(r), Math.round(r),        r, NAVY);
  circle(pixels, size, Math.round(r),        size - Math.round(r), r, NAVY);
  circle(pixels, size, size - Math.round(r), size - Math.round(r), r, NAVY);

  // Barra superior branca
  fillRect(pixels, size,
    Math.round(4*s), Math.round(4*s),
    Math.round(40*s), Math.round(6*s), WHITE);

  // Pilar esquerdo (prata)
  fillRect(pixels, size,
    Math.round(6*s), Math.round(12*s),
    Math.round(10*s), Math.round(24*s), SILVER);

  // Pilar central (dourado, mais alto)
  fillRect(pixels, size,
    Math.round(19*s), Math.round(10*s),
    Math.round(10*s), Math.round(28*s), GOLD);

  // Pilar direito (prata)
  fillRect(pixels, size,
    Math.round(32*s), Math.round(12*s),
    Math.round(10*s), Math.round(24*s), SILVER);

  // Barra inferior branca
  fillRect(pixels, size,
    Math.round(4*s), Math.round(38*s),
    Math.round(40*s), Math.round(6*s), WHITE);

  return pixels;
}

// ── Gerar arquivos ────────────────────────────────────────────────────────────

const OUT = path.join(__dirname, "..", "apps", "landing", "public");
fs.mkdirSync(OUT, { recursive: true });

const SIZES = [48, 96, 180, 192, 512];

for (const size of SIZES) {
  const pixels = drawIcon(size);
  const png    = makePNG(size, pixels);
  const file   = path.join(OUT, `icon-${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`✓  icon-${size}.png  (${png.length} bytes)`);
}

// favicon.ico é apenas o icon-48.png renomeado
fs.copyFileSync(path.join(OUT, "icon-48.png"), path.join(OUT, "favicon.ico"));
console.log("✓  favicon.ico");

console.log("\nTodos os ícones gerados em apps/landing/public/");
