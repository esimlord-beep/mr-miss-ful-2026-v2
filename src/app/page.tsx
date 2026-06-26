"use client";

import { useEffect, useState } from "react";
import { VotingExperience } from "@/components/voting-experience";
import { getContestants, getSettings } from "@/lib/contestants";

export default function Home() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

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
      }
    }
    loadData();
  }, []);

  return <VotingExperience initialContestants={contestants} siteSettings={settings} />;
}
