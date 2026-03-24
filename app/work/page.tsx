import { ScrambleText } from "@/components/scramble-text";
import Link from "next/link";

export default function Work() {
  const experiences = [
    {
      company: "ifoundanapple",
      role: "co-founder and cto (2025 - )",
      description: "we connect you anonymously with the person who found your device.",
      slug: "ifoundanapple",
    },
    {
      company: "sonaraura",
      role: "co-founder and cto (2025 - )",
      description: "music and sound effects for every business and story.",
      slug: "sonaraura",
    },
    {
      company: "investrong crm",
      role: "co-founder and cto (2025 - )",
      description: "operating system for modern real estate ai powered",
      slug: "investrong-crm",
    },
    {
      company: "elite agents",
      role: "co-founder and cto (2026 - )",
      description: "the autonomous ai agent native to apple silicon",
      slug: "elite-agents",
    },
  ];

  return (
    <div className="flex flex-col gap-16 animate-fade-in-up">
      <div className="flex flex-col gap-8">
        <h1 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="work" />
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-lg">
          here's where i've worked and the kind of products i helped ship.
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {experiences.map((exp, i) => (
          <div 
            key={`${exp.company}-${exp.role}`} 
            className="flex flex-col gap-2 animate-fade-in-up"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <Link href={`/work/${exp.slug}`} className="group/title inline-block">
              <h2 className="text-white font-bold text-base tracking-tight lowercase group-hover/title:text-orange-500 transition-colors">
                {exp.company}
              </h2>
            </Link>
            <p className="text-[12px] text-zinc-600 font-medium lowercase">{exp.role}</p>
            <p className="text-sm text-zinc-400 leading-relaxed mt-1 max-w-xl lowercase">
              {exp.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
