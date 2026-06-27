"use client";

import { useEffect, useState } from "react";
import { VotingExperience } from "@/components/voting-experience";
import { getContestants, getSettings } from "@/lib/contestants";

export default function Home() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rawContestants, rawSettings] = await Promise.all([
          getContestants(),
          getSettings(),
        ]);
        setContestants(rawContestants || []);
        setSettings(rawSettings || {});
      } catch (error) {
        console.error("Failed to fetch page content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-white">Mr & Miss FUL 2026</h1>
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest">Loading voting portal...</p>
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <main>
      <h1 className="sr-only">{settings.site_title || "Mr & Miss FUL 2026"}</h1>
      <VotingExperience initialContestants={contestants} siteSettings={settings} />
    </main>
  );
}
