import type { Metadata } from "next";
import { adminSupabase } from "@/lib/supabase";

async function getSettings() {
  if (!adminSupabase) return {};
  const { data } = await adminSupabase.from("settings").select("*").maybeSingle();
  return data ?? {};
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.awards_title ?? "FUL Awards 2026";
  const description = settings.awards_description ?? "Vote for your favorites across all categories.";

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

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
