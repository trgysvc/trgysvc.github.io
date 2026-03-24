import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Link 
        href="/blog" 
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-3 h-3" />
        <span>[back to blog]</span>
      </Link>

      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <time className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-2">
            {post.date}
          </time>
          <h1 className="text-2xl font-bold tracking-tight lowercase">
            {post.title}
          </h1>
        </header>

        <div className="text-sm text-zinc-400 leading-relaxed max-w-none">
          <p className="whitespace-pre-line lowercase">
            {post.content}
          </p>
        </div>
      </article>

      <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4">
        <Link 
          href="/blog" 
          className="text-[10px] text-zinc-600 hover:text-white transition-colors font-mono"
        >
          [end of entry]
        </Link>
      </footer>
    </div>
  );
}
