import { VotingExperience } from "@/components/voting-experience";
import { getContestants, getSettings } from "@/lib/contestants";

export default async function Home() {
  const [contestants, settings] = await Promise.all([
    getContestants(),
    getSettings(),
  ]);

  return (
    <main>
      <h1 className="sr-only">{settings.site_title || "Mr & Miss FUL 2026"}</h1>
      <VotingExperience initialContestants={contestants} siteSettings={settings} />
    </main>
  );
}
