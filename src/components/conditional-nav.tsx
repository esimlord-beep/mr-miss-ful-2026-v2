"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/site-nav";

export function ConditionalNav({ siteTitle }: { siteTitle?: string }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <SiteNav siteTitle={siteTitle} />;
}
