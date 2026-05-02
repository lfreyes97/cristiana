import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { getCollection } from "astro:content";
import fs from "node:fs";
import path from "node:path";

export async function getStaticPaths() {
  const blogPosts = await getCollection("blog");
  const notes = await getCollection("notas");

  return [...blogPosts, ...notes].map((entry) => ({
    params: { slug: entry.id },
    props: { 
        title: entry.data.title, 
        category: entry.data.category || 'Nota'
    },
  }));
}

let wasmInitialized = false;

export async function GET({ props }) {
  const { title, category } = props;

  // Initialize WASM
  if (!wasmInitialized) {
    const wasmPath = path.resolve("node_modules/@resvg/resvg-wasm/index_bg.wasm");
    const wasmBuffer = fs.readFileSync(wasmPath);
    await initWasm(wasmBuffer);
    wasmInitialized = true;
  }

  // Load fonts
  const fontPath = path.resolve("node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff");
  const fontData = fs.readFileSync(fontPath);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdfbf7",
          padding: "80px",
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "40px",
                left: "40px",
                right: "40px",
                bottom: "40px",
                border: "2px solid #e8e6e1",
                borderRadius: "20px",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "80px",
                left: "80px",
                fontSize: "32px",
                fontWeight: "900",
                color: "#1a1a1a",
                fontFamily: "EB Garamond",
              },
              children: "Cristianamente.",
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "20px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#8b2e3a",
                marginBottom: "24px",
              },
              children: category,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "72px",
                fontWeight: "bold",
                textAlign: "center",
                color: "#1a1a1a",
                fontFamily: "EB Garamond",
                lineHeight: 1.1,
                maxWidth: "900px",
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "80px",
                fontSize: "18px",
                color: "#5e5a55",
                fontFamily: "EB Garamond",
              },
              children: "Pensamiento · Fe · Cultura",
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "EB Garamond",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
