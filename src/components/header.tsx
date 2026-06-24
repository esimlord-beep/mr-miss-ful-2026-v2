"use client";

import React from "react";

interface HeaderProps {
  settings?: {
    site_title?: string;
    title?: string;
    site_description?: string;
    description?: string;
  };
}

export function Header({ settings }: HeaderProps) {
  const siteTitle = settings?.site_title || settings?.title || "Mr & Miss FUL 2026";
  const siteDescription = settings?.site_description || settings?.description || "SUG Voting Portal";

  return (
    <header className="w-full bg-white border-b border-slate-100 py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between sm:flex-row gap-4">
        <div className="text-center sm:text-left mx-auto sm:mx-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {siteTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 text-center sm:text-left">
            {siteDescription}
          </p>
        </div>
      </div>
    </header>
  );
}
