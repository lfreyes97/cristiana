import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const blog = await getCollection("blog");
  const citas = await getCollection("citas");

  const allItems = [
    ...blog.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      pubDate: post.data.pubDate,
    })),
    ...citas.map((cita) => ({
      title: cita.data.title,
      description: cita.data.description || `Cita de ${cita.data.author}`,
      link: `/citas/${cita.id}/`,
      pubDate: cita.data.pubDate,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: "Cristianamente",
    description: "Donde todo converge — Ensayos y citas desde una cosmovisión cristiana.",
    site: context.site ?? "https://cristianamente.com",
    items: allItems,
    customData: `<language>es-ES</language>`,
  });
};
