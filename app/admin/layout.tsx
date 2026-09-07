import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminUserCard from "@/components/AdminUserCard";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-obsidian-void text-obsidian-text selection:bg-brand-emerald selection:text-obsidian-void">
      {/* Obsidian Left Navigation Sidebar */}
      <aside className="w-64 border-r border-obsidian-border bg-obsidian-canvas p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Header & Status Indicator */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center font-mono font-bold text-xs text-obsidian-text">
                Z
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-white">
                CMS Console
              </h2>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 font-mono text-[10px] text-brand-emerald-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              <span>Live: DB Synchronized</span>
            </div>
          </div>

          {/* Dynamic Navigation Links */}
          <AdminNav />
        </div>

        {/* Bottom Panel: Admin User & Back to Site */}
        <div className="space-y-4 pt-4 border-t border-obsidian-border">
          <AdminUserCard />

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-card/60 hover:bg-obsidian-highlight text-obsidian-subtext hover:text-white text-xs font-mono transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Canvas with dot grid background */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-obsidian-void relative">
        <div className="fixed inset-0 bg-grid-dots pointer-events-none opacity-20" />
        <div className="relative z-10 max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
