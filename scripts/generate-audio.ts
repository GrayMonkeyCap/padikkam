/**
 * Pre-generate Malayalam audio clips using Google TTS.
 *
 *   npm run generate-audio
 *
 * - Incremental & idempotent: only generates clips not already on disk.
 * - Writes MP3s to public/audio/<clipId>.mp3.
 * - No API key needed.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src', 'content');
const OUT_DIR = join(ROOT, 'public', 'audio');
const MANIFEST = join(OUT_DIR, 'manifest.json');

interface Clip {
  id: string;
  text: string;
}

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(CONTENT, file), 'utf8')) as T;
}

function collectClips(): Clip[] {
  const phrases = loadJson<any[]>('phrases.json');
  const dialogues = loadJson<any[]>('dialogues.json');
  const clips: Clip[] = [];

  for (const p of phrases) {
    clips.push({ id: p.audio ?? p.id, text: p.script || p.roman });
  }
  for (const d of dialogues) {
    d.lines.forEach((line: any, i: number) => {
      clips.push({ id: line.audio ?? `${d.id}-l${i}`, text: line.script || line.roman });
    });
  }
  const seen = new Set<string>();
  return clips.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
}

async function synthesize(text: string): Promise<Buffer> {
  const encoded = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ml&client=tw-ob&q=${encoded}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Referer: 'https://translate.google.com/',
    },
  });
  if (!res.ok) {
    throw new Error(`Google TTS ${res.status}: ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

let hasFFmpeg: boolean | null = null;

function checkFFmpeg(): boolean {
  if (hasFFmpeg !== null) return hasFFmpeg;
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    hasFFmpeg = true;
  } catch {
    hasFFmpeg = false;
  }
  return hasFFmpeg;
}

function trimSilence(filePath: string): boolean {
  if (!checkFFmpeg()) return false;
  const tmp = filePath + '.tmp.mp3';
  try {
    execFileSync('ffmpeg', [
      '-y', '-i', filePath,
      '-af', 'silenceremove=start_periods=1:start_threshold=-40dB:start_duration=0.01,areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_duration=0.01,areverse',
      '-b:a', '64k',
      tmp,
    ], { stdio: 'ignore' });
    unlinkSync(filePath);
    renameSync(tmp, filePath);
    return true;
  } catch {
    try { unlinkSync(tmp); } catch {}
    return false;
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const clips = collectClips();

  const existing = new Set(
    existsSync(OUT_DIR) ? readdirSync(OUT_DIR).filter((f: string) => f.endsWith('.mp3')).map((f: string) => f.replace('.mp3', '')) : [],
  );
  const todo = clips.filter((c) => !existing.has(c.id));

  console.log(`Total clips: ${clips.length} · already on disk: ${existing.size} · to generate: ${todo.length}`);

  const canTrim = checkFFmpeg();
  if (canTrim) {
    console.log('ffmpeg found — will trim silence from clips.');
  } else {
    console.log('ffmpeg not found — skipping silence trimming. Install ffmpeg for tighter playback.');
  }

  if (todo.length === 0) {
    console.log('Nothing to do. ✅');
  } else {
    let success = 0;
    let failed = 0;
    for (const clip of todo) {
      process.stdout.write(`  ↳ ${clip.id} … `);
      try {
        const audio = await synthesize(clip.text);
        const outPath = join(OUT_DIR, `${clip.id}.mp3`);
        writeFileSync(outPath, audio);
        if (canTrim) trimSilence(outPath);
        console.log('done');
        success++;
        await sleep(500);
      } catch (err) {
        console.log('FAILED');
        console.error(`     ${(err as Error).message}`);
        failed++;
      }
    }
    console.log(`\nGenerated: ${success} · Failed: ${failed}`);
  }

  const present = readdirSync(OUT_DIR)
    .filter((f: string) => f.endsWith('.mp3'))
    .map((f: string) => f.replace('.mp3', ''));
  writeFileSync(MANIFEST, JSON.stringify({ generatedAt: new Date().toISOString(), clips: present }, null, 2));
  console.log(`Manifest written: ${present.length} clips available.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
