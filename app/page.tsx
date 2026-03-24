import { getBlogPosts } from "@/lib/blog";
import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
import { ScrambleText } from "@/components/scramble-text";

export default function Home() {
  const posts = getBlogPosts().slice(0, 3); // Updated to 3 posts

  const work = [
    {
      company: "ifoundanapple",
      role: "co-founder and cto (2025 - )",
      description: "connecting you anonymously with the person who found your device.",
    },
    {
      company: "sonaraura",
      role: "co-founder and cto (2025 - )",
      description: "music and sound effects for every business and story.",
    },
    {
      company: "investrong crm",
      role: "co-founder and cto (2025 - )",
      description: "operating system for modern real estate ai powered",
    },
    {
      company: "elite agents",
      role: "co-founder and cto (2026 - )",
      description: "the autonomous ai agent native to apple silicon",
    },
  ];

  const projects = [
    {
      title: "autonomous native forge",
      role: "creator",
      description: "a cloud-free, 4-agent autonomous software production pipeline running entirely on local hardware.",
    },
    {
      title: "project [coming soon]",
      role: "creator",
      description: "orchestrating the next phase of the production pipeline",
      link: "/projects",
      slug: "placeholder-1"
    },
    {
      title: "project [coming soon]",
      role: "creator",
      description: "building the future of autonomous systems",
      link: "/projects",
      slug: "placeholder-2"
    },
  ];

  return (
    <div className="flex flex-col gap-24">
      {/* Bio section */}
      <section className="flex flex-col gap-8 animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          <ScrambleText text="Turgay" />
        </h1>
        <div className="flex flex-col gap-3 text-zinc-500 text-sm">
          <p className="flex items-center gap-2">
            <MapPin size={12} className="opacity-50" /> istanbul, turkey
          </p>
          <p className="flex items-center gap-2">
            <Building2 size={12} className="opacity-50" /> software developer
          </p>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-xl mt-4">
          i'm Turgay, software and game developer. it manager turned indie maker — building apps, games and 3d experiences.
          crafting cloud-native systems, real-time game mechanics and 3d asset pipelines.
          currently building anf: an autonomous software production pipeline running on local hardware.{" "}
          <Link href="/about" className="accent hover:underline inline-flex items-center gap-1 group">
            all about <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
          </Link>
        </p>
      </section>

      {/* blog */}
      <section className="flex flex-col gap-8 animate-fade-in-up [animation-delay:200ms]">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="blog" delay={200} />
        </h2>
        <div className="flex flex-col gap-6 w-full">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex justify-between items-center py-1 opacity-80 hover:opacity-100 transition-opacity"
            >
              <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                {post.title}
              </span>
              <span className="text-xs text-zinc-600 shrink-0">
                {post.date}
              </span>
            </Link>
          ))}
          <div className="mt-2">
            <Link href="/blog" className="text-sm accent hover:underline inline-flex items-center gap-2 group">
              all posts <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* work */}
      <section className="flex flex-col gap-8 animate-fade-in-up [animation-delay:400ms]">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="work" delay={400} />
        </h2>
        <div className="flex flex-col gap-10 w-full">
          {work.map((item) => (
            <div key={item.company} className="flex flex-col gap-2">
              <h3 className="text-white font-bold text-base tracking-tight">{item.company}</h3>
              <p className="text-[11px] text-zinc-600 font-medium">{item.role}</p>
              <p className="text-sm text-zinc-400 leading-relaxed mt-1">{item.description}</p>
            </div>
          ))}
          <div className="mt-2">
            <Link href="/work" className="text-sm accent hover:underline inline-flex items-center gap-2 group">
              all work <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* projects */}
      <section className="flex flex-col gap-8 animate-fade-in-up [animation-delay:600ms]">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="projects" delay={600} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.slug || project.title} className="project-card group">
              <h3 className="text-white font-bold text-sm tracking-tight">{project.title}</h3>
              <p className="text-xs text-zinc-500">{project.role}</p>
              <p className="text-[13px] text-zinc-400 leading-relaxed mt-2">{project.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Link href="/projects" className="text-sm accent hover:underline inline-flex items-center gap-2 group">
            all projects <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
          </Link>
        </div>
      </section>

      {/* links */}
      <section className="flex flex-col gap-8 animate-fade-in-up [animation-delay:800ms]">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="links" delay={800} />
        </h2>
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm text-zinc-500">
          <Link href="mailto:turgaysavaci@gmail.com" className="hover:text-white transition-colors">email</Link>
          <Link href="https://x.com/trgysvc" target="_blank" className="hover:text-white transition-colors">x.com</Link>
          <Link href="https://github.com/trgysvc" target="_blank" className="hover:text-white transition-colors">github</Link>
          <Link href="https://linkedin.com/in/turgaysavacı" target="_blank" className="hover:text-white transition-colors">linkedin</Link>
          <Link href="https://cal.com/trgysvc" target="_blank" className="hover:text-white transition-colors">book a call</Link>
        </div>
      </section>
    </div>
  );
}
