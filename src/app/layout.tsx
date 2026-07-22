export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Cinzel, Manrope, Baloo_2 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Instagram } from "lucide-react";
import { adminSupabase } from "@/lib/supabase";
import { ConditionalNav } from "@/components/conditional-nav";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
});

async function getSettings() {
  if (!adminSupabase) return {};
  const { data } = await adminSupabase
    .from("settings")
    .select("*")
    .maybeSingle();

  return data ?? {};
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.site_title ?? "Mr & Miss FUL 2026";
  const description =
    settings.hero_description ??
    "Federal University Lokoja SUG Voting Portal";

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
  const logo = settings?.primary_logo || settings?.secondary_logo;

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${manrope.variable} ${cinzel.variable} ${baloo.variable} font-sans antialiased h-full text-slate-600 bg-slate-50/30`}
      >
        <ConditionalNav siteTitle={siteTitle} logo={logo} />

        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">{children}</div>

          <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500">
              <a href="/" className="hover:text-amber-600 transition-colors">
                Home
              </a>

              <a
                href="/awards"
                className="hover:text-amber-600 transition-colors"
              >
                Awards
              </a>

              <a
                href="/nominate"
                className="hover:text-amber-600 transition-colors"
              >
                Nominate
              </a>

              <a
                href="/contact"
                className="hover:text-amber-600 transition-colors"
              >
                Contact & Support
              </a>

              <a
                href="/terms"
                className="hover:text-amber-600 transition-colors"
              >
                Terms & Privacy
              </a>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 font-medium">
              © 2026 Mr & Miss FUL. All rights reserved.
            </p>

            <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <Instagram className="h-3.5 w-3.5 flex-shrink-0" />

              <span>Designed with ❤️ by </span>

              <a
                href="https://instagram.com/esimwebstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold transition-colors hover:text-amber-600"
              >
                Esim Web Studio
              </a>
            </p>
          </footer>
        </div>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
