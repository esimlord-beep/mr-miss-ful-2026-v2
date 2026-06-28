import { AwardsExperience } from "@/components/awards-experience";
import { browserSupabase } from "@/lib/supabase";

async function getAwardsData() {
  if (!browserSupabase) {
    return { categories: [], nominees: {}, settings: {} };
  }

  const { data: settingsData } = await browserSupabase
    .from("settings")
    .select("awards_title, awards_description, voting_status")
    .maybeSingle();

  const { data: cats } = await browserSupabase
    .from("award_categories")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  const categories = cats || [];
  const nomineeMap: Record<string, any[]> = {};

  if (categories.length > 0) {
    const categoryIds = categories.map((cat) => cat.id);
    const { data: allNominees } = await browserSupabase
      .from("award_nominees")
      .select("*")
      .in("category_id", categoryIds)
      .order("votes", { ascending: false });

    for (const cat of categories) {
      nomineeMap[cat.id] = (allNominees || []).filter((n) => n.category_id === cat.id);
    }
  }

  return {
    categories,
    nominees: nomineeMap,
    settings: settingsData || {}
  };
}

export default async function AwardsPage() {
  const { categories, nominees, settings } = await getAwardsData();

  return (
    <AwardsExperience
      initialCategories={categories}
      initialNominees={nominees}
      siteSettings={settings}
    />
  );
}
