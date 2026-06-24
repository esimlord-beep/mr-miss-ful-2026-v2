"use client";

import React, { useEffect, useState } from "react";
import { Hero } from "@/components/hero";
import { Podium } from "@/components/podium";
import { ContestantGrid } from "@/components/contestant-grid";
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
        
        const safeContestants = (rawContestants || []).map((c: any) => ({
          id: c?.id || Math.random().toString(),
          name: c?.name || "Unnamed Contestant",
          contestant_number: c?.contestant_number || "000",
          category: c?.category || "General",
          votes: c?.votes ?? 0,
          photo_url: c?.photo_url || c?.image || "https://example.com/fallback.jpg",
          department: c?.department || "General",
          faculty: c?.faculty || "General",
          bio: c?.bio || ""
        }));

        setContestants(safeContestants);
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

  // 1. Sort all contestants strictly by their votes for the leaderboard
  const sortedContestants = [...contestants].sort((a, b) => b.votes - a.votes);

  // 2. Extract the top 3 overall leaders for the podium
  const topThreeLeaders = sortedContestants.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24">
      <Hero siteSettings={settings} onExplore={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-12">
        
        <section className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-center sm:text-left border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Live Leaderboard
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Current standings based on total verified votes cast
            </p>
          </div>
          
          {/* Renders the top 3 overall leaders if contestants exist */}
          {topThreeLeaders.length > 0 && (
            <Podium 
              contestants={topThreeLeaders} 
              onVote={() => {}} 
              onProfile={() => {}} 
              {...({} as any)} 
            />
          )}
          
          {/* Renders the full list of contestants right underneath */}
          <ContestantGrid 
            contestants={sortedContestants} 
            onVote={() => {}} 
            onProfile={() => {}} 
          />
        </section>

      </div>
    </main>
  );
}
