import type { APIRoute } from "astro";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as matterNamespace from "gray-matter";
import {
  computeEffectiveStatus,
  getCollectionFromPath,
  normalizeEditorialFields,
  validateCollectionData,
} from "../../../utils/cmsValidation";

// Handle commonjs compat
const matter = (matterNamespace as any).default || matterNamespace;
export const prerender = false;

// Use process.cwd() to reliably target the root of the Astro project
const CONTENT_DIR = path.join(process.cwd(), "src", "content");

// Helper to verify auth
const isAuthenticated = (cookies: any) => {
  return (
    cookies.has("cms_session") &&
    cookies.get("cms_session")?.value === "authenticated"
  );
};

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const filePathParam = url.searchParams.get("file");

  try {
    if (filePathParam) {
      // Read specific file
      const absolutePath = path.join(CONTENT_DIR, filePathParam);

      // Basic security check to prevent directory traversal
      if (!absolutePath.startsWith(CONTENT_DIR)) {
        return new Response(JSON.stringify({ error: "Invalid path" }), {
          status: 400,
        });
      }

      const rawContent = await fs.readFile(absolutePath, "utf-8");
      // Use gray-matter to parse the file
      const parsed = matter(rawContent);

      return new Response(
        JSON.stringify({
          content: parsed.content,
          data: normalizeEditorialFields(parsed.data || {}),
        }),
        { status: 200 },
      );
    } else {
      // List all nested files
      const filePaths = await getFilesRecursively(CONTENT_DIR);

      // Read frontmatter for all files
      const filesWithMeta = await Promise.all(
        filePaths.map(async (absolutePath) => {
          try {
            const rawContent = await fs.readFile(absolutePath, "utf-8");
            const parsed = matter(rawContent);
            const normalizedData = normalizeEditorialFields(parsed.data || {});
            return {
              path: path.relative(CONTENT_DIR, absolutePath),
              data: normalizedData,
              effectiveStatus: computeEffectiveStatus(normalizedData),
            };
          } catch (e) {
            return {
              path: path.relative(CONTENT_DIR, absolutePath),
              data: {},
              effectiveStatus: "draft",
            };
          }
        }),
      );

      return new Response(JSON.stringify({ files: filesWithMeta }), {
        status: 200,
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { file, content, data } = await request.json();

    if (!file || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing file or content" }),
        { status: 400 },
      );
    }

    const absolutePath = path.join(CONTENT_DIR, file);
    if (!absolutePath.startsWith(CONTENT_DIR)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
      });
    }

    const collection = getCollectionFromPath(file);
    const normalizedData = normalizeEditorialFields(data || {});
    const fieldErrors = validateCollectionData(collection, normalizedData);
    if (Object.keys(fieldErrors).length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", fieldErrors }),
        { status: 422 },
      );
    }

    normalizedData.updatedDate = new Date().toISOString();
    // Combine frontmatter data with content
    const rawOutput = matter.stringify(content, normalizedData);

    // Ensure directory exists
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });

    await fs.writeFile(absolutePath, rawOutput, "utf-8");
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ cookies, url }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const filePathParam = url.searchParams.get("file");
  if (!filePathParam) {
    return new Response(JSON.stringify({ error: "Missing file parameter" }), {
      status: 400,
    });
  }

  try {
    const absolutePath = path.join(CONTENT_DIR, filePathParam);
    if (!absolutePath.startsWith(CONTENT_DIR)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
      });
    }

    await fs.unlink(absolutePath);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

async function getFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      // Ignore dot files/folders like .obsidian
      if (entry.name.startsWith(".")) return [];
      return entry.isDirectory() ? getFilesRecursively(res) : res;
    }),
  );
  return Array.prototype.concat(...files);
}
