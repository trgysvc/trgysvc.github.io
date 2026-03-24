import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  return files.map((filename) => {
    const slug = filename.replace(".md", "");
    const fullPath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(fullPath, "utf-8");

    // Simple metadata extraction (minimalist, no 3rd party parser)
    const lines = fileContent.split("\n");
    const title = lines[0].replace("# ", "") || "Untitled";
    const date = lines[1] || "";
    const excerpt = lines.slice(3, 6).join(" ") || "";

    return {
      slug,
      title,
      date,
      excerpt,
      content: fileContent,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContent = fs.readFileSync(fullPath, "utf-8");
  const lines = fileContent.split("\n");
  const title = lines[0].replace("# ", "") || "Untitled";
  const date = lines[1] || "";

  return {
    slug,
    title,
    date,
    excerpt: "",
    content: fileContent,
  };
}
