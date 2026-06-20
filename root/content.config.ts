import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    writing: defineCollection({
      type: 'page',
      source: 'writing/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        readTime: z.number(),
        image: z.string(),
        excerpt: z.string(),
      }),
    }),
  },
});
