"use client";

import { ScrambleText } from "@/components/scramble-text";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Youtube, 
  Instagram, 
  Codepen, 
  Database, 
  BadgeCheck,
  Globe,
  Palette,
  SquareTerminal,
  BookOpen,
  Send
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function LinksPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const socials = [
    { icon: <Github size={20} />, href: "https://github.com/trgysvc", label: "GitHub" },
    { icon: <Globe size={20} />, href: "https://trgysvc.github.io/", label: "Portfolio" },
    { icon: <Linkedin size={20} />, href: "https://www.linkedin.com/in/turgaysavac%C4%B1/", label: "LinkedIn" },
    { icon: <Database size={20} />, href: "https://www.kaggle.com/turgaysavac", label: "Kaggle" },
    { icon: <Codepen size={20} />, href: "https://codepen.io/turgay-savac", label: "CodePen" },
    { icon: <Send size={20} />, href: "https://mastodon.social/", label: "Mastodon" },
    { icon: <Palette size={20} />, href: "https://www.behance.net/turgaysavaci/appreciated", label: "Behance" },
    { icon: <SquareTerminal size={20} />, href: "https://dev.to/turgaysavaci", label: "Dev.to" },
    { icon: <BookOpen size={20} />, href: "https://medium.com/@turgaysavaci", label: "Medium" },
    { icon: <Twitter size={20} />, href: "https://x.com/trgysvc", label: "X" },
  ];

  const sections = [
    {
      title: "products",
      links: [
        { label: "ifoundanapple.com", href: "https://ifoundanapple.com" },
        { label: "sonaraura.com", href: "https://sonaraura.com" },
        { label: "Elite Agents", href: "https://github.com/trgysvc/EliteAgent" },
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
