import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turgay Savacı — Privacy-First Autonomous AI Agents",
  description: "Building privacy-first autonomous AI agents that run entirely on Apple Silicon. Creator of PheronAgent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} font-mono bg-black text-white min-h-screen selection:bg-white selection:text-black`}
      >
        <div className="centered-container px-6 py-12 md:py-16 flex flex-col gap-12">
          <Navigation />

          <main className="flex flex-col gap-24">
            {children}
          </main>

          <Footer />
        </div>
        <GoogleAnalytics gaId="G-7JMJ2LWCCQ" />
      </body>
    </html>
  );
}
