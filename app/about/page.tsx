import { ScrambleText } from "@/components/scramble-text";

export default function About() {
  return (
    <div className="flex flex-col gap-12 animate-fade-in-up">
      <div className="flex flex-col gap-8">
        <h1 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="about" />
        </h1>
        <div className="flex flex-col gap-10 text-zinc-400 text-sm leading-relaxed max-w-xl">
          <div className="flex flex-col gap-2">
            <p className="text-white font-medium">turgay savacı</p>
            <p>
              I build privacy-first autonomous AI agents that run entirely on local hardware — no cloud, no data leaving your device. I believe the most powerful software is the kind that respects your privacy by design, not as a marketing checkbox.
            </p>
          </div>

          <div>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-2 font-bold italic">why local-first</p>
            <p>
              After 20+ years architecting enterprise infrastructure — including the tier-certified data center and data systems at Istanbul Grand Airport (IGA) — I learned exactly how much of your data leaves your control the moment it touches the cloud. So I build the opposite: sovereign, on-device software where your data never leaves your machine. That background isn't nostalgia; it's why I take privacy and reliability seriously at a level most indie tools don't.
            </p>
          </div>

          <div>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-2 font-bold italic">what I'm building</p>
            <p>
              <strong className="text-zinc-200">PheronAgent</strong> — an autonomous AI agent native to Apple Silicon, with 40+ tools, running entirely on your Mac. No cloud inference, no telemetry you didn't ask for.
            </p>
            <p className="mt-3">
              Alongside it, I open-source how I test these agents: a framework-agnostic testing methodology with a 58-block universal test battery, so the reliability claims I make are ones anyone can verify.
            </p>
          </div>

          <div>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-2 font-bold italic">background</p>
            <p>
              Deep experience in system architecture, integration, and enterprise standards (COBIT, ITIL, ISO 27001), with earlier work in Objective-C and Swift. Today that seniority goes into one thing: building local-first AI tools I'd actually trust with my own data.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-900">
            <a href="https://pheronagent.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2">
              <span className="text-xs">→</span> pheronagent.com
            </a>
            <a href="https://github.com/trgysvc/AgentTestMethodology" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2">
              <span className="text-xs">→</span> github.com/trgysvc/AgentTestMethodology
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

