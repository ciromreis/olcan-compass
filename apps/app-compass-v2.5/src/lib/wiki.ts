import fs from "fs";
import path from "path";

export interface WikiDocument {
  id: string;
  category: string;
  slug: string;
  title: string;
  content: string;
  frontmatter: Record<string, string>;
}

/**
 * Terminal OIOS Document Loader
 * Carrega e processa documentos Markdown da Wiki do monorepo.
 */
export async function getWikiDocument(category: string, slug: string): Promise<WikiDocument | null> {
  try {
    // Caminho para a Wiki no monorepo (subindo 3 níveis de apps/app-compass-v2.5/src/lib)
    const wikiRoot = path.join(process.cwd(), "../../wiki");
    const filePath = path.join(wikiRoot, category, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      console.warn(`Wiki doc not found: ${category}/${slug}`);
      return null;
    }

    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter(rawContent);

    return {
      id: `${category}-${slug}`,
      category,
      slug,
      title: data.title || slug.replace(/_/g, " "),
      content,
      frontmatter: data,
    };
  } catch (error) {
    console.error("Error loading wiki document:", error);
    return null;
  }
}

/**
 * Parser de Frontmatter (Simples)
 * Extrai metadados entre blocos --- no início do arquivo.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = raw.match(frontmatterRegex);

  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const content = raw.replace(match[0], "").trim();
  const data: Record<string, string> = {};

  yamlBlock.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      data[key.trim().toLowerCase()] = valueParts.join(":").trim().replace(/^['"]|['"]$/g, "");
    }
  });

  return { data, content };
}

/**
 * Lista todos os documentos de uma categoria
 */
export async function listWikiCategory(category: string) {
  try {
    const wikiRoot = path.join(process.cwd(), "../../wiki");
    const categoryPath = path.join(wikiRoot, category);

    if (!fs.existsSync(categoryPath)) return [];

    const files = fs.readdirSync(categoryPath);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(".md", ""));
  } catch (error) {
    return [];
  }
}
