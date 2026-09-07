import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import BackToTopButton from "@/components/BackToTopButton";
import PublicNavbar from "@/components/PublicNavbar";

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

      {/* Sticky Responsive Obsidian Precision Glassmorphism Header */}
      <PublicNavbar />

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
