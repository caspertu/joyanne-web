#!/usr/bin/env node
/**
 * 从 ihavenoidea 复制预构建下载物到 public/downloads/
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SOURCE = path.resolve(ROOT, '../ihavenoidea');
const OUT_DIR = path.join(ROOT, 'public/downloads');

const args = process.argv.slice(2);
const sourceIdx = args.indexOf('--source');
const SOURCE = sourceIdx >= 0 ? path.resolve(args[sourceIdx + 1]) : DEFAULT_SOURCE;

const ARTIFACTS = [
  { src: '全本.epub', dest: '七公主的发疯日常_全本.epub' },
  { src: '七公主的发疯日常_全本.pdf', dest: '七公主的发疯日常_全本.pdf' },
];

async function main() {
  console.log(`📦 sync-downloads: ${SOURCE} → ${OUT_DIR}`);
  await fs.mkdir(OUT_DIR, { recursive: true });

  let copied = 0;
  for (const { src, dest } of ARTIFACTS) {
    const from = path.join(SOURCE, src);
    const to = path.join(OUT_DIR, dest);
    try {
      await fs.access(from);
      await fs.copyFile(from, to);
      const stat = await fs.stat(to);
      console.log(`  ✓ ${dest} (${(stat.size / 1024).toFixed(0)} KB)`);
      copied++;
    } catch {
      console.warn(`  ⚠ 跳过（不存在）: ${src}`);
    }
  }

  console.log(`\n✅ 复制完成: ${copied} 个文件`);
}

main();