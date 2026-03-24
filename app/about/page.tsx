import { ScrambleText } from "@/components/scramble-text";

export default function About() {
  return (
    <div className="flex flex-col gap-12 animate-fade-in-up">
      <div className="flex flex-col gap-8">
        <h1 className="text-sm font-bold uppercase tracking-widest flex items-center">
          <span className="section-asterisk">*</span>
          <ScrambleText text="about" />
        </h1>
        <div className="flex flex-col gap-10 text-zinc-400 text-sm leading-relaxed max-w-xl whitespace-pre-line">
          <p className="text-white font-medium">turgay savacı</p>
          <p>
            software engineer and game developer focused on building elegant, minimalist products. i believe that the tools we build should be as beautiful as they are functional; a reflection of my philosophy: simplicity, utility, and a touch of calculated chaos.
          </p>

          <div>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-2 font-bold italic">the transition</p>
            after 20+ years of orchestrating complex it infrastructures and high-scale network systems, i have returned to the foundational joy of pure creation. my journey is a transition from managing massive enterprise ecosystems—including the tier-certified data center and comprehensive data infrastructure at istanbul grand airport (iga)—to living in the terminal and obsessing over industrial design.
          </div>

          <div>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-2 font-bold italic">technical pedigree</p>
            i have a deep background as a technology leader, with extensive experience in project management, system integration, and infrastructure development. my past work includes producing high-quality solutions using objective c and swift for erp integrations, architecting data centers, and mastering enterprise standards like cobit, itil, and iso 27001.
          </div>

          <div>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-2 font-bold italic">creative focus</p>
            today, i leverage this technical seniority to build immersive digital experiences. i find great fulfillment in transforming raw ideas into functional applications or games.
            {"\n\n"}
            <span className="text-zinc-300">game dev:</span> specializing in unreal engine with a focus on game mechanics and user experience.
            {"\n"}
            <span className="text-zinc-300">3d design:</span> creating high-end 3d animations and assets using blender.
            {"\n"}
            <span className="text-zinc-300">sound architecture:</span> experimenting with soundscapes and the intersection of audio and code.
          </div>

          <div className="border-t border-zinc-900 pt-10">
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-2 font-bold italic">current mission: anf</p>
            i am currently building anf — autonomous native forge: a cloud-free, 4-agent autonomous software production pipeline running entirely on local hardware with no cloud dependency. it represents my focus on building sovereign, decentralized, and highly efficient software manufacturing tools.
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <a href="#" className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2">
              <span className="text-xs">→</span> view full resume
            </a>
            <a href="https://github.com/trgysvc/autonomousnativeforge" className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2">
              <span className="text-xs">→</span> github.com/trgysvc/autonomousnativeforge
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
