import type { APIRoute } from 'astro';
import { getPublishedChapters, chapterSlug, formatChapterLabel } from '../lib/chapters';
import site from '../../content-meta/site.json';

export const GET: APIRoute = async (context) => {
  const chapters = await getPublishedChapters();
  const siteUrl = context.site?.href ?? 'https://www.joyanna.online';

  const items = chapters
    .slice()
    .reverse()
    .map((ch) => {
      const slug = chapterSlug(ch);
      const bodyText = ch.body.replace(/\s+/g, '').slice(0, 200);
      return `    <item>
      <title>${formatChapterLabel(ch)}</title>
      <link>${siteUrl}/read/${slug}</link>
      <guid isPermaLink="true">${siteUrl}/read/${slug}</guid>
      <pubDate>${ch.data.publishedAt.toUTCString()}</pubDate>
      <description><![CDATA[${bodyText}]]></description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${site.title}</title>
    <link>${siteUrl}</link>
    <description>${site.hook}</description>
    <language>zh-CN</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};