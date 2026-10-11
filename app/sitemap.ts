import type { MetadataRoute } from "next";

import { listPublishedPostSlugs } from "@/lib/services/posts";
import { listPublishedPageSlugs } from "@/lib/services/pages";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/sobre"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contato"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/privacidade"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/termos"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [posts, pages] = await Promise.all([
    listPublishedPostSlugs(),
    listPublishedPageSlugs(),
  ]);

  const reserved = new Set([
    "sobre",
    "blog",
    "contato",
    "privacidade",
    "termos",
    "admin",
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => !reserved.has(page.slug))
    .map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...postEntries, ...pageEntries];
}
