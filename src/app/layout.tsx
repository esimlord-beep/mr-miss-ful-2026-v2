export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mr & Miss FUL 2026",
  description: "Federal University Lokoja SUG Voting Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} antialiased h-full text-slate-600 bg-slate-50/30`}>
        <Header />
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
