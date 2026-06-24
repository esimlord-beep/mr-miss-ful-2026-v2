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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Loading voting portal...</p>
        </div>
      </div>
    );
  }

  return <VotingExperience initialContestants={contestants} siteSettings={settings} />;
}
