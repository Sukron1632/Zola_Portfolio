import React from "react";
import Link from "next/link";
import { Shield, Terminal } from "lucide-react";
import BackToTopButton from "@/components/BackToTopButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-obsidian-void text-obsidian-text flex flex-col justify-between selection:bg-brand-emerald selection:text-obsidian-void relative">
      {/* Background Dot Grid Matrix with Vignette */}
      <div className="fixed inset-0 bg-grid-dots pointer-events-none opacity-40 z-0" />
      
      {/* Multi-Layer Ambient Spatial Lighting Orbs */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-brand-emerald/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-0 translate-x-1/4 w-[600px] h-[600px] bg-brand-cyan/[0.035] rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 left-0 -translate-x-1/4 w-[500px] h-[500px] bg-brand-emerald/[0.03] rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Sticky Obsidian Precision Glassmorphism Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-obsidian-void/75 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Status Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center font-mono font-bold text-sm text-obsidian-text group-hover:border-brand-emerald/60 group-hover:text-brand-emerald group-hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] transition-all duration-300">
                Z
              </div>
              <span className="font-semibold text-sm tracking-tight text-obsidian-text group-hover:text-white transition-colors hidden sm:inline">
                Zola DF Portfolio
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald-dim font-mono text-[11px] font-medium tracking-tight shadow-sm shadow-brand-emerald/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald" />
              </span>
              AVAILABLE FOR WORK / CONTRACTS
            </div>
          </div>

          {/* Navigation Links with Micro-Interactions */}
          <nav className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm text-obsidian-subtext font-medium">
            <a
              href="#about"
              className="hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-emerald after:transition-all after:duration-300 hover:after:w-full"
            >
              About
            </a>
            <a
              href="#skills"
              className="hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-emerald after:transition-all after:duration-300 hover:after:w-full"
            >
              Skills
            </a>
            <a
              href="#experience"
              className="hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-emerald after:transition-all after:duration-300 hover:after:w-full"
            >
              Experience
            </a>
            <a
              href="#projects"
              className="hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-emerald after:transition-all after:duration-300 hover:after:w-full"
            >
              Projects
            </a>
            <a
              href="#certifications"
              className="hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-emerald after:transition-all after:duration-300 hover:after:w-full hidden sm:inline"
            >
              Certifications
            </a>

            {/* CMS Portal Button */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-obsidian-border hover:border-brand-emerald/40 bg-obsidian-card/80 text-obsidian-text hover:text-white text-xs font-mono transition-all hover:bg-obsidian-highlight hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
            >
              <Shield className="w-3.5 h-3.5 text-brand-emerald" />
              <span>CMS Portal</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area with relative z-index */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Floating Back to Top Button */}
      <BackToTopButton />

      {/* Obsidian Minimalist Footer */}
      <footer className="border-t border-obsidian-border/80 py-10 bg-obsidian-canvas/60 backdrop-blur-md relative z-10 text-xs text-obsidian-muted">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-emerald" />
            <span className="font-mono text-[11px] text-obsidian-subtext">
              Zola Dimas Firmansyah — Information Systems & Junior Web Developer
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-obsidian-muted">
              © {new Date().getFullYear()} Precision Engine
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
