export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { adminSupabase } from "@/lib/supabase";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

async function getSettings() {
  if (!adminSupabase) return {};
  const { data } = await adminSupabase.from("settings").select("*").maybeSingle();
  return data ?? {};
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.site_title ?? "Mr & Miss FUL 2026";
  const description = settings.hero_description ?? "Federal University Lokoja SUG Voting Portal";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/apple-icon.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/apple-icon.png"],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} antialiased h-full text-slate-600 bg-slate-50/30`}>
        <nav className="bg-slate-900 px-4 py-3 relative" x-data="{ open: false }">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-white font-black text-sm">Mr & Miss FUL 2026</p>
            <div className="relative">
              <details className="group">
                <summary className="list-none cursor-pointer flex flex-col gap-1.5 p-2">
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                </summary>
                <div className="absolute right-0 top-12 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 py-2 w-60 z-50 overflow-hidden">
                  <a href="/" className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/5 transition-colors">
                    <span className="text-lg">🎭</span> Mr & Miss FUL Voting
                  </a>
                  <a href="/awards" className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-amber-400 hover:bg-white/5 transition-colors">
                    <span className="text-lg">🏆</span> FUL Awards 2026
                  </a>
                  <div className="my-1 border-t border-slate-700/50" />
                  <a href="/contact" className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <span className="text-lg">💬</span> Contact & Support
                  </a>
                  <a href="/terms" className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <span className="text-lg">📄</span> Terms & Privacy
                  </a>
                </div>
              </details>
            </div>
          </div>
        </nav>
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
            {children}
          </div>
          <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500">
              <a href="/" className="hover:text-amber-600">Home</a>
              <a href="/awards" className="hover:text-amber-600">Awards</a>
              <a href="/contact" className="hover:text-amber-600">Contact & Support</a>
              <a href="/terms" className="hover:text-amber-600">Terms & Privacy</a>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 font-medium">
              © 2026 Mr & Miss FUL · Federal University Lokoja SUG
            </p>
          </footer>
        </div>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
