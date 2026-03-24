import { ScrambleText } from "@/components/scramble-text";
import Link from "next/link";
import { notFound } from "next/navigation";

const SLUG_MAP: Record<string, string> = {
  "ifoundanapple": "ifoundanapple",
  "sonaraura": "sonaraura",
  "investrong-crm": "investrong crm",
  "elite-agents": "elite agents",
};

export function generateStaticParams() {
  return Object.keys(SLUG_MAP).map((slug) => ({
    slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const title = SLUG_MAP[slug];

  if (!title) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-12 animate-fade-in-up">
      <div className="flex flex-col gap-8">
        <h1 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text={`work / ${title}`} />
        </h1>
        
        <div className="flex flex-col gap-8 text-zinc-400 text-sm leading-relaxed max-w-xl">
          <p className="text-white font-medium lowercase italic">
            detailed information for {title} will be added soon.
          </p>
          
          <p className="text-zinc-500">
            currently orchestrating the foundational components and preparing a deep dive into the architecture, 
            challenges, and technical evolution of this project.
          </p>

          <div className="pt-8">
            <Link href="/work" className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2 group">
              <span className="text-xs group-hover:-translate-x-0.5 transition-transform">←</span> 
              back to all work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
