"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X, Shield, ExternalLink } from "lucide-react";
import AdminUserCard from "@/components/AdminUserCard";
import AdminNav from "@/components/AdminNav";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-obsidian-void text-obsidian-text selection:bg-brand-emerald selection:text-obsidian-void">
      {/* ============================================================ */}
      {/* 1. DESKTOP PERMANENT SIDEBAR (Hidden on mobile / tablet)    */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex w-64 border-r border-obsidian-border bg-obsidian-canvas p-5 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Header & Status Indicator */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center font-mono font-bold text-xs text-obsidian-text shadow-sm">
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
          <AdminNav onNavigate={() => setMobileMenuOpen(false)} />
        </div>

        {/* Bottom Panel: Admin User & Back to Site */}
        <div className="space-y-4 pt-4 border-t border-obsidian-border shrink-0">
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

      {/* ============================================================ */}
      {/* 2. MOBILE & TABLET TOP HEADER BAR (Hidden on desktop lg+)   */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 border-b border-obsidian-border bg-obsidian-canvas/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md border border-obsidian-border bg-obsidian-card text-obsidian-text hover:text-white hover:border-brand-emerald/50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-obsidian-card border border-obsidian-border flex items-center justify-center font-mono font-bold text-xs text-white">
                Z
              </div>
              <span className="text-xs font-semibold text-white font-mono">
                CMS Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 font-mono text-[9px] text-brand-emerald-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              <span>Live Sync</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-obsidian-border bg-obsidian-card/70 text-obsidian-subtext hover:text-white text-[11px] font-mono transition-colors"
              title="Return to Public Portfolio"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Portfolio</span>
            </Link>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 3. MOBILE SLIDING DRAWER & BACKDROP (Hidden on desktop lg+)  */}
        {/* ============================================================ */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-72 max-w-[85vw] bg-obsidian-canvas border-r border-obsidian-border p-5 flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250 ease-out overflow-y-auto">
              <div className="space-y-6">
                {/* Header in Drawer */}
                <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center font-mono font-bold text-xs text-white">
                        Z
                      </div>
                      <h2 className="text-sm font-semibold tracking-tight text-white font-mono">
                        CMS Console
                      </h2>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 font-mono text-[9px] text-brand-emerald-dim">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                      <span>DB Synchronized</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-md text-obsidian-subtext hover:text-white hover:bg-obsidian-highlight transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation in Drawer */}
                <AdminNav onNavigate={() => setMobileMenuOpen(false)} />
              </div>

              {/* Bottom in Drawer */}
              <div className="space-y-4 pt-4 border-t border-obsidian-border shrink-0 mt-6">
                <AdminUserCard />

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-card/60 hover:bg-obsidian-highlight text-obsidian-subtext hover:text-white text-xs font-mono transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Public Portfolio</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. MAIN ADMIN CONTENT CANVAS (Responsive padding)           */}
        {/* ============================================================ */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-obsidian-void relative">
          <div className="fixed inset-0 bg-grid-dots pointer-events-none opacity-20" />
          <div className="relative z-10 max-w-6xl mx-auto space-y-8 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
