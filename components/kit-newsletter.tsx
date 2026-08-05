"use client";

import { useEffect, useRef } from "react";

export function KitNewsletter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Clean up container before attaching script
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://trgysvc.kit.com/023bef0354/index.js";
    script.async = true;
    script.setAttribute("data-uid", "023bef0354");
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full mt-8 pt-6 border-t border-zinc-900/60 flex flex-col items-start gap-4">
      <p className="text-xs text-zinc-400 font-mono leading-relaxed lowercase w-full">
        building local-first ai agents on apple silicon. i write about what actually works — the bugs, the benchmarks, the honest results. get the next writeup in your inbox.
      </p>
      <div ref={containerRef} className="kit-embed-wrapper w-full" />
    </div>
  );
}
