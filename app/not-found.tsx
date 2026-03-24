import { ScrambleText } from "@/components/scramble-text";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-12 animate-fade-in-up pt-20 text-center items-center">
      <div className="flex flex-col gap-8 items-center">
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="text-orange-500">*</span>
          <ScrambleText text="404 | not found" />
        </h1>
        
        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm lowercase">
          the page you are looking for has been moved, removed, or never existed in the current terminal state.
        </p>

        <div className="pt-8">
          <Link href="/" className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2 group italic text-xs">
            <span className="text-xs group-hover:-translate-x-0.5 transition-transform">←</span> 
            return to system root
          </Link>
        </div>
      </div>
    </div>
  );
}
