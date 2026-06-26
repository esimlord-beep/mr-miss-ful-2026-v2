export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mr & Miss FUL 2026",
  description: "Federal University Lokoja SUG Voting Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} antialiased h-full text-slate-600 bg-slate-50/30`}>
        <nav className="bg-slate-900 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <a href="/" className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-colors">
              🎭 Mr & Miss FUL
            </a>
            <a href="/awards" className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-amber-400 border border-amber-400/40 hover:bg-amber-400/10 transition-colors">
              🏆 FUL Awards
            </a>
          </div>
        </nav>
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
            {children}
          </div>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
