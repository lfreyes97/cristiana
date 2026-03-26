import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const editorialStatusSchema = z.enum([
  "draft",
  "review",
  "approved",
  "scheduled",
  "published",
]);

const seoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    canonical: z.string().optional(),
    ogImage: z.string().optional(),
  })
  .optional();

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().optional(),
    category: z.string(),
    icon: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: editorialStatusSchema.optional(),
    publishAt: z.string().optional(),
    draft: z.boolean().optional(),
    seo: seoSchema,
  }),
});

const citas = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/citas" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    author: z.string(),
    source: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    status: editorialStatusSchema.optional(),
    publishAt: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().optional(),
    seo: seoSchema,
  }),
});

export const collections = { blog, citas };
