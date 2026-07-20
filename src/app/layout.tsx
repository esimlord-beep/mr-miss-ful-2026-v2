export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { adminSupabase } from "@/lib/supabase";
import { SiteNav } from "@/components/site-nav";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const siteTitle = settings?.site_title ?? "Mr & Miss FUL 2026";

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} antialiased h-full text-slate-600 bg-slate-50/30`}>
        <SiteNav siteTitle={siteTitle} />
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
