"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, ArrowLeft, AlertCircle } from "lucide-react";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Login failed:", err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl border border-obsidian-border bg-obsidian-card/95 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
      {/* Top Ambient Subtle Rim Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-brand-emerald to-transparent" />

      {/* Header Monogram & Status */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-obsidian-void border border-obsidian-border-focus text-brand-emerald shadow-inner">
          <Shield className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald font-mono text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
          RESTRICTED / MISSION CONTROL
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          Admin CMS Authentication
        </h1>
        <p className="text-xs text-obsidian-subtext max-w-xs mx-auto leading-relaxed">
          Authorized administrative access for system engineering, telemetry monitoring, and content lifecycle management.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Akses Ditolak (Unauthorized)</p>
            <p className="text-[11px] text-red-400/90 leading-normal">
              {error === "AccessDenied"
                ? "Hanya akun terdaftar (zoladimas32@gmail.com) yang diizinkan masuk ke Content Management System ini."
                : "Terjadi kesalahan saat memproses autentikasi Google. Silakan coba kembali."}
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-white hover:bg-neutral-200 text-obsidian-void font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-brand-emerald/20 disabled:opacity-50 group cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-obsidian-void border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{loading ? "Menghubungkan ke Google..." : "Lanjutkan dengan Google"}</span>
        </button>

        {/* Security Policy Badge */}
        <div className="p-3 rounded-lg border border-obsidian-border bg-obsidian-void/60 text-[11px] text-obsidian-subtext space-y-1">
          <div className="flex items-center gap-1.5 text-obsidian-text font-medium font-mono text-[10px]">
            <Lock className="w-3 h-3 text-brand-emerald" />
            <span>SECURITY WHITELIST ENFORCEMENT</span>
          </div>
          <p className="text-[10px] leading-relaxed text-obsidian-subtext/80">
            Akses dibatasi hanya untuk identitas Google terdaftar:{" "}
            <span className="text-brand-cyan font-mono">zoladimas32@gmail.com</span>. Permintaan dari email lain akan ditolak otomatis oleh sistem.
          </p>
        </div>
      </div>

      {/* Back to Public Link */}
      <div className="pt-2 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-obsidian-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Portofolio Publik</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="fixed inset-0 z-50 bg-obsidian-void text-obsidian-text flex items-center justify-center p-4 selection:bg-brand-emerald selection:text-obsidian-void overflow-y-auto">
      {/* Dot Matrix Background */}
      <div className="fixed inset-0 bg-grid-dots pointer-events-none opacity-40 z-0" />
      <div className="relative z-10 w-full flex justify-center py-8">
        <Suspense fallback={<div className="text-xs text-obsidian-subtext animate-pulse">Memuat gerbang autentikasi...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
