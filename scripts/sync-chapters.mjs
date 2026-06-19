#!/usr/bin/env node
/**
 * sync-chapters.mjs — 从 ihavenoidea 解析章节 MD，注入 frontmatter 写入 content collection。
 * 用法: node scripts/sync-chapters.mjs [--source /path/to/ihavenoidea]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SOURCE = path.resolve(ROOT, '../ihavenoidea');

const args = process.argv.slice(2);
const sourceIdx = args.indexOf('--source');
const SOURCE =
  (sourceIdx >= 0 ? path.resolve(args[sourceIdx + 1]) : null) ??
  (process.env.IHAVENOIDEA_ROOT ? path.resolve(process.env.IHAVENOIDEA_ROOT) : null) ??
  DEFAULT_SOURCE;
const CHAPTERS_DIR = path.join(SOURCE, 'chapters');
const README_PATH = path.join(CHAPTERS_DIR, 'README.md');
const OVERRIDES_PATH = path.join(ROOT, 'content-meta/overrides.json');
const OUT_DIR = path.join(ROOT, 'src/content/chapters');

const FILE_RE = /^chapter-(\d{2})([ab])?\.md$/;
const H2_RE = /^##\s*第([一二三四五六七八九十百零\d]+)章\s+(.+)$/m;
const END_RE = /——\s*第.+章\s*完\s*——/;
const CN_DIGITS = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const CN_UNITS = { 十: 10, 百: 100 };

function parseChineseNumber(text) {
  if (/^\d+$/.test(text)) return Number(text);
  let result = 0;
  let current = 0;
  for (const ch of text) {
    if (ch in CN_DIGITS) {
      current = CN_DIGITS[ch];
    } else if (ch in CN_UNITS) {
      const unit = CN_UNITS[ch];
      if (current === 0) current = 1;
      result += current * unit;
      current = 0;
    }
  }
  return result + current;
}

function countChineseChars(text) {
  const matches = text.match(/[\u4e00-\u9fff]/g);
  return matches ? matches.length : 0;
}

function getGitDate(filePath) {
  try {
    const rel = path.relative(SOURCE, filePath);
    const out = execSync(
      `git -C "${SOURCE}" log -1 --format=%cI -- "${rel}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

async function loadOverrides() {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { chapters: {} };
  }
}

async function loadReadmeTitles() {
  const titles = new Map();
  try {
    const readme = await fs.readFile(README_PATH, 'utf8');
    const rowRe = /\|\s*`(chapter-\d{2}[ab]?)`\s*\|\s*第([一二三四五六七八九十百零\d]+)章\s+([^|]+)\s*\|/g;
    let m;
    while ((m = rowRe.exec(readme)) !== null) {
      titles.set(m[1], { number: parseChineseNumber(m[2]), title: m[3].trim() });
    }
  } catch {
    // README optional
  }
  return titles;
}

function stripChapter01Preamble(lines) {
  const out = [];
  for (const line of lines) {
    if (line.startsWith('# ')) continue;
    if (line.match(/^——\s*.+卷\s*——\s*$/)) continue;
    out.push(line);
  }
  return out;
}

function processBody(raw, isChapter01) {
  let lines = raw.split('\n');
  if (isChapter01) lines = stripChapter01Preamble(lines);

  const h2Match = raw.match(H2_RE);
  if (!h2Match) throw new Error('缺少 ## 第N章 标题行');

  const title = h2Match[2].trim();
  const h2Line = h2Match[0];

  lines = lines.filter((l) => l.trim() !== h2Line.trim());
  let body = lines.join('\n').trim();

  if (!END_RE.test(body)) {
    console.warn('  ⚠ 缺少结尾标记「—— 第N章 完 ——」');
  }

  return { title, body };
}

function validateWordCount(count, slug) {
  if (count < 900) {
    console.error(`  ✗ ERROR ${slug}: 汉字 ${count} < 900，阻断 build`);
    return 'error';
  }
  if (count < 1500) {
    console.warn(`  ⚠ WARN ${slug}: 汉字 ${count} < 1500（短篇章节，待扩写）`);
  }
  if (count < 2500) console.warn(`  ⚠ WARN ${slug}: 汉字 ${count} < 2500`);
  else if (count < 4500) console.info(`  ℹ INFO ${slug}: 汉字 ${count} < 4500（目标区间未达）`);
  else if (count > 7000) console.warn(`  ⚠ WARN ${slug}: 汉字 ${count} > 7000，考虑拆章`);
  return 'ok';
}

function buildFrontmatter(fields) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fields)) {
    if (v === null) lines.push(`${k}: null`);
    else if (typeof v === 'string') lines.push(`${k}: "${v.replace(/"/g, '\\"')}"`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function compareSlug(a, b) {
  const pa = FILE_RE.exec(a);
  const pb = FILE_RE.exec(b);
  if (!pa || !pb) return a.localeCompare(b);
  const na = Number(pa[1]);
  const nb = Number(pb[1]);
  if (na !== nb) return na - nb;
  const sa = pa[2] || '';
  const sb = pb[2] || '';
  return sa.localeCompare(sb);
}

async function main() {
  console.log(`📚 sync-chapters: ${CHAPTERS_DIR} → ${OUT_DIR}`);

  const overrides = await loadOverrides();
  const readmeTitles = await loadReadmeTitles();

  let files;
  try {
    files = (await fs.readdir(CHAPTERS_DIR))
      .filter((f) => FILE_RE.test(f))
      .sort(compareSlug);
  } catch (err) {
    console.error(`✗ 无法读取章节目录: ${CHAPTERS_DIR}`);
    console.error(err.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('✗ 未找到 chapter-*.md 文件');
    process.exit(1);
  }

  const previousSlugs = new Set();
  try {
    const existing = await fs.readdir(OUT_DIR);
    for (const f of existing) {
      if (f.endsWith('.md')) previousSlugs.add(f.replace(/\.md$/, ''));
    }
  } catch {
    // first run
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const published = [];
  let hasError = false;
  const newSlugs = new Set();

  for (const file of files) {
    const m = FILE_RE.exec(file);
    const num = Number(m[1]);
    const part = m[2] ?? null;
    const slug = `chapter-${m[1]}${part ?? ''}`;
    newSlugs.add(slug);

    const srcPath = path.join(CHAPTERS_DIR, file);
    const raw = await fs.readFile(srcPath, 'utf8');
    const isChapter01 = file === 'chapter-01.md';

    let title, body;
    try {
      ({ title, body } = processBody(raw, isChapter01));
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
      hasError = true;
      continue;
    }

    const wordCount = countChineseChars(body);
    const wcResult = validateWordCount(wordCount, slug);
    if (wcResult === 'error') hasError = true;

    const override = overrides.chapters?.[slug] ?? {};
    const status = override.status ?? 'published';
    const publishedAt =
      override.publishedAt ??
      getGitDate(srcPath) ??
      new Date().toISOString();

    const readme = readmeTitles.get(slug);
    if (readme && readme.title !== title) {
      console.warn(`  ⚠ ${slug}: H2 标题与 README 不一致`);
      console.warn(`    H2: ${title}`);
      console.warn(`    README: ${readme.title}`);
    }

    const frontmatter = buildFrontmatter({
      chapterNumber: num,
      part,
      title,
      wordCount,
      publishedAt,
      status,
      volume: 1,
      sourceFile: file,
    });

    const outPath = path.join(OUT_DIR, `${slug}.md`);
    await fs.writeFile(outPath, `${frontmatter}\n\n${body}\n`, 'utf8');
    console.log(`  ✓ ${slug} — ${title} (${wordCount} 字)`);

    if (status === 'published') published.push(num);
  }

  // 删除已移除的章节
  for (const old of previousSlugs) {
    if (!newSlugs.has(old)) {
      await fs.unlink(path.join(OUT_DIR, `${old}.md`));
      console.warn(`  ⚠ 已删除过时章节: ${old}`);
    }
  }

  // 连续性校验
  const uniquePublished = [...new Set(published)].sort((a, b) => a - b);
  if (uniquePublished.length > 0) {
    for (let i = uniquePublished[0]; i <= uniquePublished[uniquePublished.length - 1]; i++) {
      if (!uniquePublished.includes(i)) {
        console.error(`✗ ERROR: 已发布章节缺少第 ${i} 章`);
        hasError = true;
      }
    }
  }

  const publishedCount = uniquePublished.length;
  const prevPublishedCount = [...previousSlugs].filter((s) => !s.includes('draft')).length;
  if (prevPublishedCount > 0 && publishedCount < prevPublishedCount) {
    console.error(`✗ ERROR: 已发布章数从 ${prevPublishedCount} 降至 ${publishedCount}`);
    hasError = true;
  }

  console.log(`\n✅ 同步完成: ${files.length} 章，已发布 ${publishedCount} 章`);
  if (hasError) process.exit(1);
}

main();