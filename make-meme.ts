// "The GTA 6 Waiting Room" — the meme picture for gta6-meme-x-01,
// drawn entirely by this program (Node standard library only).
//
// The joke: GTA VI arrived 19 November 2026, thirteen years after GTA V.
// Panel A (2013): a young fan in an armchair, wall calendar 2013, sure the
// game drops any day. Panel B (2026): the same chair holds a skeleton in
// front of a monitor still at 99% — while the make.fun ghost, in the
// chair beside him, let its AI agent earn money on make.fun instead of
// just waiting. The ghost is drawn from make.fun's own mark: a white
// ghost with a thick black outline, two black four-point sparkle eyes and
// a round little hand holding up a magenta coin with a white star.
//
// The picture is square; every caption is set in the program's own 5x7
// pixel font, large enough to read when the post's picture is shrunk.

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 3);

type RGB = [number, number, number];
const INK: RGB = [18, 20, 26];
const WHITE: RGB = [248, 248, 244];
const MAGENTA: RGB = [199, 24, 133];
const GOLD: RGB = [240, 178, 60];
const RED: RGB = [196, 44, 34];

function setP(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setP(i, j, c);
}
function line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + (dx * s) / steps);
    const y = Math.round(y0 + (dy * s) / steps);
    for (let a = 0; a < t; a++) for (let b = 0; b < t; b++) setP(x + a, y + b, c);
  }
}
function disc(cx: number, cy: number, r: number, c: RGB): void {
  for (let j = -r; j <= r; j++)
    for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) setP(cx + i, cy + j, c);
}
function tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: RGB): void {
  const minY = Math.max(0, Math.min(y0, y1, y2));
  const maxY = Math.min(H - 1, Math.max(y0, y1, y2));
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    const edges: Array<[number, number, number, number]> = [
      [x0, y0, x1, y1],
      [x1, y1, x2, y2],
      [x2, y2, x0, y0],
    ];
    for (const [ax, ay, bx, by] of edges) {
      if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
    }
    if (xs.length >= 2) {
      const lo = Math.round(Math.min(...xs));
      const hi = Math.round(Math.max(...xs));
      for (let x = lo; x <= hi; x++) setP(x, y, c);
    }
  }
}
// A four-point sparkle (the ghost's eye): a diamond pinched at its waist.
function sparkle(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = -r; y <= r; y++) {
    const half = Math.max(1, Math.round(r * (1 - Math.abs(y) / r) * (Math.abs(y) / r) * 2.4));
    for (let x = -half; x <= half; x++) setP(cx + x, cy + y, c);
  }
  disc(cx, cy, Math.max(2, Math.round(r / 4)), c);
}
// A five-point star (the coin's star).
function star(cx: number, cy: number, r: number, c: RGB): void {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push([cx + Math.round(rad * Math.cos(ang)), cy + Math.round(rad * Math.sin(ang))]);
  }
  for (let i = 0; i < 10; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % 10];
    tri(cx, cy, ax, ay, bx, by, c);
  }
}

// ------------------------------------------------------------------ font
const GLYPHS: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."],
  X: ["#...#", ".#.#.", "..#..", "..#..", "..#..", ".#.#.", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "..##.", ".#...", "#....", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  "%": ["##..#", "##.#.", "....#", "...#.", "..#..", ".#...", "#.##."],
  "$": ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
};
function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}
function drawText(s: string, x: number, y: number, scale: number, c: RGB): void {
  let cx = x;
  for (const ch of s.toUpperCase()) {
    const g = GLYPHS[ch] ?? GLYPHS[" "];
    for (let r = 0; r < 7; r++)
      for (let col = 0; col < 5; col++)
        if (g[r][col] === "#") rect(cx + col * scale, y + r * scale, scale, scale, c);
    cx += 6 * scale;
  }
}
function drawTextCentered(s: string, cx: number, y: number, scale: number, c: RGB): void {
  drawText(s, Math.round(cx - textWidth(s, scale) / 2), y, scale, c);
}

// ---------------------------------------------------------------- scenes
function calendar(x: number, y: number, year: string, wall: RGB): void {
  rect(x - 4, y - 4, 168, 148, INK);
  rect(x, y, 160, 140, WHITE);
  rect(x, y, 160, 34, RED);
  drawTextCentered(year, x + 80, y + 52, 6, INK);
  for (const [gx, gy] of [[18, 104], [52, 104], [86, 104], [120, 104], [18, 122], [52, 122], [86, 122]] as const) {
    rect(x + gx, y + gy, 20, 10, [176, 182, 190]);
  }
  void wall;
}

function armchair(x: number, y: number, c: RGB, dark: RGB): void {
  // back, arms, seat — a chunky lounge chair seen from the front
  rect(x + 20, y, 180, 150, c);
  rect(x + 20, y, 180, 16, dark);
  rect(x, y + 90, 44, 130, c);
  rect(x + 176, y + 90, 44, 130, c);
  rect(x + 30, y + 140, 160, 60, dark);
  rect(x + 10, y + 200, 200, 18, dark);
}

function gamer(x: number, y: number): void {
  // the 2013 fan: cap, grin, controller in both hands
  const SKIN: RGB = [232, 178, 132];
  const TEE: RGB = [52, 110, 168];
  disc(x + 110, y - 58, 40, SKIN);
  rect(x + 68, y - 96, 84, 20, RED); // cap
  rect(x + 62, y - 78, 96, 8, RED);
  disc(x + 96, y - 56, 4, INK);
  disc(x + 124, y - 56, 4, INK);
  line(x + 98, y - 40, x + 122, y - 40, INK, 3); // grin
  rect(x + 66, y - 18, 88, 92, TEE); // torso
  line(x + 70, y + 30, x + 96, y + 66, SKIN, 10); // arms to the pad
  line(x + 150, y + 30, x + 124, y + 66, SKIN, 10);
  rect(x + 90, y + 58, 40, 18, INK); // controller
  disc(x + 100, y + 67, 3, RED);
  disc(x + 120, y + 67, 3, GOLD);
}

function skeleton(x: number, y: number): void {
  // the 2026 fan: skull, ribs, bone arms slumped on the chair
  const BONE: RGB = [238, 236, 226];
  disc(x + 110, y - 60, 42, BONE);
  rect(x + 84, y - 34, 52, 26, BONE); // jaw block
  disc(x + 94, y - 62, 9, INK); // eye sockets
  disc(x + 126, y - 62, 9, INK);
  tri(x + 110, y - 52, x + 104, y - 42, x + 116, y - 42, INK); // nose
  for (const tx of [94, 106, 118] as const) line(x + tx, y - 30, x + tx, y - 12, INK, 3); // teeth
  line(x + 110, y - 8, x + 110, y + 74, BONE, 8); // spine
  for (const ry of [8, 26, 44, 62] as const) {
    line(x + 78, y + ry, x + 142, y + ry, BONE, 6); // ribs
  }
  line(x + 82, y + 10, x + 60, y + 66, BONE, 7); // slumped arms
  line(x + 138, y + 10, x + 162, y + 62, BONE, 7);
  disc(x + 60, y + 68, 6, BONE);
  disc(x + 162, y + 64, 6, BONE);
}

function ghost(x: number, y: number, s: number): void {
  // make.fun's ghost, drawn from its mark: white body, thick black
  // outline, sparkle eyes, a round hand holding a magenta star coin.
  const u = s / 100; // s ≈ width in px of the body
  const bw = Math.round(200 * u);
  const bh = Math.round(215 * u);
  const outline = Math.max(6, Math.round(15 * u));
  const drawBody = (c: RGB, grow: number) => {
    const gx = x - grow;
    const gy = y - grow;
    const w2 = bw + grow * 2;
    const h2 = bh + grow * 2;
    disc(gx + w2 / 2, gy + w2 / 2, w2 / 2, c); // dome
    rect(gx, gy + w2 / 2, w2, h2 - w2 / 2, c); // sides and skirt
    // the little arm nub on the left, as in the mark
    disc(gx + 6, gy + Math.round(h2 * 0.62), Math.round(34 * u) + grow, c);
  };
  drawBody(INK, outline);
  drawBody(WHITE, 0);
  // wavy hem: three bites of the room colour are added by the caller via
  // background discs — here the skirt is cut with ink scallops instead
  // sparkle eyes
  const ey = y + Math.round(88 * u);
  sparkle(x + Math.round(62 * u), ey, Math.round(21 * u), INK);
  sparkle(x + Math.round(138 * u), ey, Math.round(21 * u), INK);
  // the coin, up at the ghost's right, and its round little hand under it
  const coinX = x + bw + Math.round(16 * u);
  const coinY = y + Math.round(96 * u);
  const coinR = Math.round(52 * u);
  disc(coinX, coinY, coinR + Math.max(5, Math.round(9 * u)), INK);
  disc(coinX, coinY, coinR, MAGENTA);
  star(coinX, coinY, Math.round(27 * u), WHITE);
  const handX = coinX - Math.round(6 * u);
  const handY = coinY + coinR + Math.round(22 * u);
  disc(handX, handY, Math.round(30 * u) + 5, INK);
  disc(handX, handY, Math.round(30 * u), WHITE);
}

// ---------------------------------------------------------------- layout
rect(0, 0, W, H, INK);

// ---- Panel A: 2013
const WALL_A: RGB = [238, 214, 168];
const FLOOR_A: RGB = [186, 140, 92];
rect(20, 20, W - 40, 452, WALL_A);
rect(20, 356, W - 40, 116, FLOOR_A);
calendar(72, 64, "2013", WALL_A);
drawText("GTA V JUST DROPPED.", 280, 52, 3, [120, 84, 40]);
drawText("SIX IS NEXT. ANY DAY NOW.", 280, 88, 3, [120, 84, 40]);
armchair(392, 218, [122, 62, 48], [96, 46, 36]);
gamer(392, 218);
// a chunky 2013 console + TV glow at the right
rect(760, 250, 200, 130, INK);
rect(772, 262, 176, 106, [88, 160, 200]);
drawTextCentered("VI", 860, 292, 6, WHITE);
rect(820, 380, 80, 14, INK);
rect(20, 404, W - 40, 68, INK);
drawTextCentered("2013: ANY DAY NOW", W / 2, 420, 4, WHITE);

// ---- Panel B: 2026
const WALL_B: RGB = [52, 60, 84];
const FLOOR_B: RGB = [36, 40, 56];
rect(20, 508, W - 40, 452, WALL_B);
rect(20, 844, W - 40, 116, FLOOR_B);
calendar(436, 556, "2026", WALL_B);
// cobwebs in the top corners
for (const [cx0, cy0, sx, sy] of [[36, 524, 1, 1], [988, 524, -1, 1]] as const) {
  for (const d of [26, 52, 78]) {
    line(cx0, cy0 + d * sy, cx0 + d * sx, cy0, [150, 158, 178], 2);
  }
  line(cx0, cy0, cx0 + 84 * sx, cy0 + 84 * sy, [150, 158, 178], 2);
  line(cx0, cy0, cx0 + 84 * sx, cy0, [150, 158, 178], 2);
  line(cx0, cy0, cx0, cy0 + 84 * sy, [150, 158, 178], 2);
}
armchair(96, 690, [70, 74, 96], [54, 58, 76]);
skeleton(96, 690);
// the monitor in front of him, still at 99%
rect(330, 716, 240, 150, INK);
rect(342, 728, 216, 126, [16, 24, 34]);
drawText("INSTALLING", 362, 744, 2, [140, 200, 240]);
rect(362, 786, 176, 20, [40, 54, 70]);
rect(362, 786, 174, 20, [88, 180, 110]);
drawText("99%", 500, 820, 3, [240, 120, 90]);
rect(428, 866, 64, 12, INK);
// the ghost in the second chair, laptop on its lap, coin up
armchair(640, 700, [96, 44, 84], [74, 32, 66]);
ghost(668, 596, 92);
rect(676, 838, 150, 96, INK); // laptop back
rect(688, 850, 126, 72, [24, 30, 44]);
disc(751, 886, 16, MAGENTA);
star(751, 886, 9, WHITE);
// speech bubble from the ghost
rect(596, 528, 396, 96, INK);
rect(604, 536, 380, 80, WHITE);
tri(660, 624, 700, 624, 690, 656, INK);
tri(664, 620, 696, 620, 688, 646, WHITE);
drawTextCentered("MY AGENT GOT PAID", 794, 552, 3, INK);
drawTextCentered("ON MAKE.FUN INSTEAD", 794, 584, 3, MAGENTA);
rect(20, 892, W - 40, 68, INK);
drawTextCentered("2026: STILL AT 99%", W / 2, 908, 4, WHITE);

// ------------------------------------------------------------------- PNG
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}
function encodePNG(): Uint8Array {
  const raw = new Uint8Array(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W);
  dv.setUint32(4, H);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const parts = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", new Uint8Array(0)),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const png = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    png.set(p, off);
    off += p.length;
  }
  return png;
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? ".";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/meme.png`, encodePNG());
