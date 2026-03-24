"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  // Hide navigation on /links
  if (pathname === "/links") return null;

  return (
    <header className="flex items-center gap-6 text-sm font-medium mb-12">
      <Link href="/" className="nav-link">
        [h] home
      </Link>
      <Link href="/blog" className="nav-link">
        [b] blog
      </Link>
      <Link href="/work" className="nav-link">
        [w] work
      </Link>
      <Link href="/projects" className="nav-link">
        [p] projects
      </Link>
    </header>
  );
}
