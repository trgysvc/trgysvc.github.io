import { ScrambleText } from "@/components/scramble-text";

export default function Projects() {
  const projects = [
    {
      title: "autonomous native forge (anf)",
      role: "creator",
      period: "2026 - present",
      description: "a cloud-free, 4-agent autonomous software production pipeline running entirely on local hardware with no cloud dependency.",
      achievements: [
        "implemented sovereign, decentralized software manufacturing",
        "zero-dependency local agent orchestration",
        "highly efficient automated production workflow",
      ],
      technologies: ["python", "local llms", "agentic workflows", "rust"],
      link: "https://github.com/trgysvc/AutonomousNativeForge",
    },
    {
      title: "project [coming soon]",
      role: "creator",
      period: "2026",
      description: "detailed information for this project will be added soon. focusing on building sovereign and efficient tools.",
      achievements: [
        "research and development in progress",
        "architecting core components",
        "security and performance optimization",
      ],
      technologies: ["coming soon"],
      link: "#",
    },
    {
      title: "project [coming soon]",
      role: "creator",
      period: "2026",
      description: "detailed information for this project will be added soon. exploring the frontiers of decentralized tech.",
      achievements: [
        "ideation and prototyping phase",
        "defining technical specifications",
        "evaluating integration patterns",
      ],
      technologies: ["coming soon"],
      link: "#",
    },
  ];

  return (
    <div className="flex flex-col gap-16 animate-fade-in-up">
      <div className="flex flex-col gap-8">
        <h1 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="projects" />
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">
          here are some of the projects i've worked on. i love building tools that make developers' lives easier and exploring new technologies along the way.
        </p>
      </div>

      <div className="flex flex-col gap-24">
        {projects.map((project, i) => (
          <div 
            key={`${project.title}-${i}`} 
            className="project-card group animate-fade-in-up"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <div className="flex flex-col gap-2">
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-white tracking-tight hover:text-zinc-400 group inline-flex items-center gap-2">
                {project.title} <span className="section-asterisk group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">↗</span>
              </a>
              <p className="text-[11px] text-zinc-600 font-medium lowercase">
                {project.role} ({project.period})
              </p>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed font-medium mt-2">
              {project.description}
            </p>

            <div className="flex flex-col gap-12 mt-4">
              <div className="flex flex-col gap-4 border-l border-neutral-900 pl-6">
                <h3 className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">achievements</h3>
                <ul className="flex flex-col gap-3">
                  {project.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-[13px] text-zinc-500 flex gap-2 leading-relaxed">
                      <span className="text-neutral-800 shrink-0">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4 border-l border-neutral-900 pl-6">
                <h3 className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">technologies</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-3 pt-1">
                  {project.technologies.map((tech, techIdx) => (
                    <span key={`${tech}-${techIdx}`} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
