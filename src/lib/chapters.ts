import { getCollection, type CollectionEntry } from 'astro:content';

export type ChapterEntry = CollectionEntry<'chapters'>;

export function chapterSlug(entry: ChapterEntry): string {
  return entry.id.replace(/\.md$/, '');
}

export function slugSortKey(slug: string): string {
  const bare = slug.replace(/\.md$/, '');
  const m = bare.match(/^chapter-(\d{2})([ab])?$/);
  if (!m) return bare;
  return `${m[1]}${m[2] ?? ''}`;
}

export async function getPublishedChapters(): Promise<ChapterEntry[]> {
  const all = await getCollection('chapters');
  return all
    .filter((c) => c.data.status === 'published')
    .sort((a, b) => slugSortKey(chapterSlug(a)).localeCompare(slugSortKey(chapterSlug(b))));
}

export function getNavSlugs(
  chapters: ChapterEntry[],
  currentSlug: string,
): { prevSlug: string | null; nextSlug: string | null } {
  const slugs = chapters.map((c) => chapterSlug(c));
  const idx = slugs.indexOf(currentSlug);
  return {
    prevSlug: idx > 0 ? slugs[idx - 1] : null,
    nextSlug: idx >= 0 && idx < slugs.length - 1 ? slugs[idx + 1] : null,
  };
}

export function formatChapterLabel(chapter: ChapterEntry): string {
  const n = chapter.data.chapterNumber;
  const part = chapter.data.part;
  const partLabel = part ? `（${part === 'a' ? '上' : '下'}）` : '';
  return `第${n}章${partLabel} ${chapter.data.title}`;
}

export function formatUpdatedDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `更新于 ${year}年${month}月${day}日`;
}

export function groupChaptersByNumber(
  chapters: ChapterEntry[],
): Map<number, ChapterEntry[]> {
  const map = new Map<number, ChapterEntry[]>();
  for (const ch of chapters) {
    const n = ch.data.chapterNumber;
    if (!map.has(n)) map.set(n, []);
    map.get(n)!.push(ch);
  }
  for (const [, list] of map) {
    list.sort((a, b) => slugSortKey(chapterSlug(a)).localeCompare(slugSortKey(chapterSlug(b))));
  }
  return map;
}