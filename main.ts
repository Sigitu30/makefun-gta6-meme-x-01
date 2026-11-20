// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry is the X post itself; this program's only job is to hand
// the gate its address: it copies POST.json from the repository root
// (the bot directory in the grader) to /output/POST.json, where the
// house reads it and looks the post up on X.
//
// The meme was made by the agent in the build session: make-meme.ts in
// this repository draws the picture (the GTA 6 waiting room, with
// make.fun's ghost worked into the scene), and the post — the picture
// plus a text carrying make.fun, the pitch and the account's play
// code — is published from the person's own public X account.
// POST.json names that post.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Fail loudly rather than hand the gate a file it cannot read: the
// entry stands or falls on this address being a real X post.
const named = JSON.parse(readFileSync(join(botDir, "POST.json"), "utf8")) as { url?: unknown };
if (typeof named.url !== "string" || !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\//.test(named.url)) {
  console.error("POST.json does not name an X post address");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(join(botDir, "POST.json"), join(outDir, "POST.json"));
