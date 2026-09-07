"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Menu,
  X,
  User,
  Cpu,
  Briefcase,
  FolderGit2,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "About", href: "#about", icon: User },
  { name: "Skills", href: "#skills", icon: Cpu },
  { name: "Experience", href: "#experience", icon: Briefcase },
  { name: "Projects", href: "#projects", icon: FolderGit2 },
  { name: "Certifications", href: "#certifications", icon: BadgeCheck },
];

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-obsidian-void/85 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo & Status Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center font-mono font-bold text-sm text-obsidian-text group-hover:border-brand-emerald/60 group-hover:text-brand-emerald group-hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] transition-all duration-300">
              Z
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white group-hover:text-brand-emerald transition-colors">
                Zola Dimas
              </span>
              <span className="text-[10px] font-mono text-obsidian-muted sm:hidden">
                Portfolio
              </span>
            </div>
          </Link>

          {/* Available for work badge on Desktop */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald-dim font-mono text-[11px] font-medium tracking-tight shadow-sm shadow-brand-emerald/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald" />
            </span>
            AVAILABLE FOR WORK / CONTRACTS
          </div>
        </div>

        {/* Right Desktop Nav (md and up) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs lg:text-sm text-obsidian-subtext font-medium">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-emerald after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.name}
            </a>
          ))}

          {/* CMS Portal Button */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-obsidian-border hover:border-brand-emerald/40 bg-obsidian-card/80 text-obsidian-text hover:text-white text-xs font-mono transition-all hover:bg-obsidian-highlight hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
          >
            <Shield className="w-3.5 h-3.5 text-brand-emerald" />
            <span>CMS Portal</span>
          </Link>
        </nav>

        {/* Right Mobile Actions (below md) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Quick status dot on mobile */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald-dim font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
            <span>Open</span>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md border border-obsidian-border bg-obsidian-card text-obsidian-text hover:text-white hover:border-brand-emerald/40 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown / Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-black/75 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Card */}
          <div className="bg-obsidian-void/95 border-b border-obsidian-border/80 px-4 py-5 shadow-2xl animate-in slide-in-from-top-4 duration-200 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <div className="space-y-4 max-w-md mx-auto">
              {/* Mobile Availability Badge */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald-dim font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald" />
                  </span>
                  <span>AVAILABLE FOR WORK / CONTRACTS</span>
                </div>
                <span className="text-[10px] text-brand-emerald uppercase">2024-2025</span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 pt-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium text-obsidian-subtext hover:text-white hover:bg-obsidian-card/80 border border-transparent hover:border-obsidian-border transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-brand-emerald group-hover:scale-110 transition-transform" />
                        <span>{item.name}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-obsidian-muted group-hover:text-brand-emerald transition-colors" />
                    </a>
                  );
                })}
              </div>

              {/* CMS Admin Link */}
              <div className="pt-3 border-t border-obsidian-border/80">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-md bg-obsidian-card border border-obsidian-border hover:border-brand-emerald/50 text-white text-xs font-mono transition-all hover:bg-obsidian-highlight"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-brand-emerald" />
                    <span>Access CMS Admin Portal</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
                    Secure
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
