import { fallbackContestants } from "@/lib/sample-data";
import { browserSupabase } from "@/lib/supabase";
import type { Contestant } from "@/types";

export async function getContestants(): Promise<Contestant[]> {
  try {
    if (!browserSupabase) {
      return fallbackContestants;
    }

    const { data, error } = await browserSupabase.from("contestants").select("*");

    if (error || !data || data.length === 0) {
      return fallbackContestants;
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name || item.full_name || "Unnamed Contestant",
      contestant_number: item.contestant_number || "000",
      category: item.category || "General",
      votes: item.votes ?? 0,
      photo_url: item.photo_url || item.image || "https://example.com/your-image-1.jpg",
      department: item.department || item.faculty || "General",
      faculty: item.faculty || "General",
      bio: item.bio || item.description || ""
    }));
  } catch (err) {
    console.error("Critical error in getContestants:", err);
    return fallbackContestants;
  }
}

export async function getContestantById(id: string): Promise<Contestant | null> {
  try {
    const contestants = await getContestants();
    return contestants.find((c) => c.id === id) || null;
  } catch {
    return null;
  }
}

export async function getSettings(): Promise<any> {
  const localFallback = {
    site_title: "Mr & Miss FUL 2026",
    hero_description: "Federal University Lokoja SUG Voting Portal",
    footer_text: "Copyright ©️ 2026 Mr & Miss FUL 2026 — Federal University Lokoja SUG. All Rights Reserved."
  };

  try {
    if (!browserSupabase) {
      return localFallback;
    }

    const { data, error } = await browserSupabase.from("settings").select("*").maybeSingle();

    if (error || !data) {
      return localFallback;
    }

    return {
      id: data.id,
      site_title: data.site_title || localFallback.site_title,
      hero_description: data.hero_description || localFallback.hero_description,
      primary_logo: data.primary_logo || null,
      secondary_logo: data.secondary_logo || null,
      voting_status: data.voting_status || "open",
      vote_price: data.vote_price || 200,
      footer_text: data.footer_text || localFallback.footer_text
    };
  } catch {
    return localFallback;
  }
}
