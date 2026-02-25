import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async (context) => {
  const site = (context.site ?? "https://cristianamente.com")
    .toString()
    .replace(/\/$/, "");

  const blog = await getCollection("blog");
  const citas = await getCollection("citas");

  const items = [
    ...blog.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `${site}/blog/${post.id}/`,
      pubDate: post.data.pubDate,
    })),
    ...citas.map((cita) => ({
      title: cita.data.title,
      description: cita.data.description ?? `Cita de ${cita.data.author}`,
      link: `${site}/citas/${cita.id}/`,
      pubDate: cita.data.pubDate,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Cristianamente</title>
    <description>Donde todo converge — Ensayos y citas desde una cosmovisión cristiana.</description>
    <link>${site}</link>
    <language>es-ES</language>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
