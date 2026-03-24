"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on /links
  if (pathname === "/links" || pathname === "/links/") return null;

  return (
    <footer className="text-[11px] text-zinc-600 mt-12 flex justify-between items-center opacity-50 pb-8">
      <p>trgysvc</p>
      <p>© {new Date().getFullYear()}</p>
    </footer>
  );
}
