"use client";

import { ScrambleText } from "@/components/scramble-text";
import {
  Database,
  BadgeCheck,
  Globe,
  Palette,
  SquareTerminal,
  BookOpen,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

// Inline SVG brand icons (removed from lucide-react 1.x)
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.638 5.902-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CodepenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
    <line x1="12" y1="22" x2="12" y2="15.5" />
    <polyline points="22 8.5 12 15.5 2 8.5" />
    <polyline points="2 15.5 12 8.5 22 15.5" />
    <line x1="12" y1="2" x2="12" y2="8.5" />
  </svg>
);

export default function LinksPage() {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const socials = [
    { icon: <GithubIcon />, href: "https://github.com/trgysvc", label: "GitHub" },
    { icon: <Globe size={20} />, href: "https://trgysvc.github.io/", label: "Portfolio" },
    { icon: <LinkedinIcon />, href: "https://www.linkedin.com/in/turgaysavac%C4%B1/", label: "LinkedIn" },
    { icon: <Database size={20} />, href: "https://www.kaggle.com/turgaysavac", label: "Kaggle" },
    { icon: <CodepenIcon />, href: "https://codepen.io/turgay-savac", label: "CodePen" },
    { icon: <Send size={20} />, href: "https://mastodon.social/", label: "Mastodon" },
    { icon: <Palette size={20} />, href: "https://www.behance.net/turgaysavaci/appreciated", label: "Behance" },
    { icon: <SquareTerminal size={20} />, href: "https://dev.to/turgaysavaci", label: "Dev.to" },
    { icon: <BookOpen size={20} />, href: "https://medium.com/@turgaysavaci", label: "Medium" },
    { icon: <XIcon />, href: "https://x.com/trgysvc", label: "X" },
  ];

  const sections = [
    {
      title: "products",
      links: [
        { label: "ifoundanapple.com", href: "https://ifoundanapple.com" },
        { label: "sonaraura.com", href: "https://sonaraura.com" },
        { label: "pheronagent.com", href: "https://www.pheronagent.com" },
      ],
    },
    {
      title: "works",
      links: [
        { label: "Investrong CRM", href: "https://realestate.tukanft.com/en" },
        { label: "AutonomousNativeForge", href: "https://github.com/trgysvc/AutonomousNativeForge", tag: "NEW" },
      ],
    },
  ];

  const mediaSections = [
    {
      id: "youtube",
      title: "youtube",
      images: [
        { src: "/media/yt1.png", href: "#" },
        { src: "/media/yt2.png", href: "#" },
        { src: "/media/yt3.png", href: "#" },
      ],
    },
    {
      id: "instagram",
      title: "instagram",
      images: [
        { 
          src: "/media/ig_post_1.jpg", 
          href: "https://www.instagram.com/p/DVgsj7cCCZR/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
        },
        { src: "/media/ig_post_2.jpg", href: "#" },
        { 
          src: "/media/ig_post_3.png", 
          href: "https://www.instagram.com/p/DORIfF8CDqV/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
        },
      ],
    },
  ];

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex flex-col items-center w-full max-w-[500px] mx-auto py-12 animate-fade-in-up">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 mb-10 text-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-white lowercase">
            <ScrambleText text="Turgay" />
          </h1>
          <BadgeCheck size={18} className="text-yellow-500 fill-yellow-500/20" />
        </div>
        <p className="text-zinc-500 text-sm lowercase max-w-[400px] leading-relaxed">
          Hi 👋 i'm Turgay, software and game developer. it manager turned indie maker — building apps, games and 3d experiences. crafting cloud-native systems, real-time game mechanics and 3d asset pipelines. currently building anf: an autonomous software production pipeline running on local hardware.
        </p>
      </div>

      {/* Social Icons Row */}
      <div className="flex justify-center gap-6 mb-12 text-zinc-500">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            {social.icon}
          </a>
        ))}
      </div>

      {/* Media Sections (Collapsible) */}
      <div className="flex flex-col gap-6 w-full px-4 mb-12 items-center">
        {mediaSections.map((section) => (
          <div key={section.id} className="w-full flex flex-col items-center">
            <button
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              className="group flex items-center gap-2 text-red-600 hover:text-red-500 transition-colors py-2 lowercase font-bold text-sm tracking-tight"
            >
              <span className="text-[10px] mt-0.5">
                {expanded === section.id ? "▼" : "▶"}
              </span>
              {section.title}
            </button>
            
            <div 
              className={`grid transition-all duration-300 ease-in-out w-full overflow-hidden ${
                expanded === section.id ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
              }`}
            >
              <div className="min-h-0 flex flex-nowrap gap-2 overflow-x-auto pb-4 px-2 no-scrollbar justify-center">
                {section.images.map((img, i) => (
                  <a 
                    key={i} 
                    href={img.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[140px] h-[248px] relative rounded-lg overflow-hidden border border-zinc-900 group/img block"
                  >
                    <Image
                      src={img.src}
                      alt={`${section.title} preview ${i + 1}`}
                      fill
                      className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link Sections */}
      <div className="flex flex-col gap-10 w-full px-4">
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-4 text-center">
            <h2 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] px-2 italic">
              {section.title}
            </h2>
            <div className="flex flex-col gap-3">
              {section.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group flex items-center justify-center p-4 border border-zinc-900 rounded-lg bg-black hover:border-zinc-700 transition-all active:scale-[0.98]"
                >
                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors flex items-center gap-3 lowercase text-center">
                    {link.label}
                  </span>
                  {link.tag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 border border-green-900/50 text-green-600 rounded bg-green-950/20 lowercase ml-2">
                      {link.tag}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
