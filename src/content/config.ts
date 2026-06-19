import { defineCollection, z } from 'astro:content';

const chapters = defineCollection({
  type: 'content',
  schema: z.object({
    chapterNumber: z.number().int().min(1).max(199),
    part: z.enum(['a', 'b']).nullable().default(null),
    title: z.string(),
    wordCount: z.number().int(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    status: z.enum(['published', 'draft']).default('published'),
    volume: z.number().int().default(1),
    sourceFile: z.string(),
    sourceVariant: z.enum(['chapters', 'chapter_v2']).default('chapters'),
  }),
});

export const collections = { chapters };