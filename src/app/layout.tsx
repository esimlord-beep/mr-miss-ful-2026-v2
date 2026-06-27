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
                <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 w-52 z-50">
                  <a href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50">
                    🎭 Mr & Miss FUL Voting
                  </a>
                  <a href="/awards" className="flex items-center gap-3 px-4 py-3 text-sm font-black text-amber-600 hover:bg-amber-50">
                    🏆 FUL Awards 2026
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
        </div>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
