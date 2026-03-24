import { getBlogPosts } from "@/lib/blog";
import Link from "next/link";
import { ScrambleText } from "@/components/scramble-text";

export default function Blog() {
  const posts = getBlogPosts();

  return (
    <div className="flex flex-col gap-12 animate-fade-in-up">
      <div className="flex flex-col gap-8">
        <h1 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="blog" />
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-lg">
          thoughts, essays, and technical writeups.
        </p>
      </div>

      <div className="flex flex-col gap-6 mt-4 w-full">
        {posts.length === 0 ? (
          <p className="py-12 text-zinc-600 italic text-sm lowercase">no posts yet.</p>
        ) : (
          posts.map((post, i) => (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post.slug}
              className="group flex justify-between items-center py-2 opacity-80 hover:opacity-100 transition-opacity animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <span className="text-sm text-zinc-400 group-hover:text-white transition-colors lowercase">
                {post.title}
              </span>
              <span className="text-xs text-zinc-600 font-mono shrink-0 lowercase">
                {post.date}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
