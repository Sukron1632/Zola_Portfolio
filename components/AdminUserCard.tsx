"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, LogIn, UserCircle, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminUserCard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 p-2 text-obsidian-muted text-xs animate-pulse">
        <div className="w-8 h-8 rounded-full bg-obsidian-border" />
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-obsidian-border rounded w-20" />
          <div className="h-2 bg-obsidian-border rounded w-28" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-3 rounded-lg border border-obsidian-border bg-obsidian-canvas/90 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <UserCircle className="w-8 h-8 text-obsidian-muted" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-obsidian-canvas" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-obsidian-text truncate">
                Admin Portal
              </p>
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
            <p className="text-[10px] font-mono text-obsidian-subtext truncate">
              Authentication Active
            </p>
          </div>
        </div>

        <Link
          href="/admin/login"
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded border border-brand-emerald/40 hover:border-brand-emerald bg-brand-emerald/10 text-brand-emerald hover:text-white text-[11px] font-medium transition-all"
        >
          <LogIn className="w-3 h-3" />
          Sign In with Google
        </Link>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border border-obsidian-border bg-obsidian-canvas/90 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "Admin"}
              className="w-8 h-8 rounded-full border border-brand-emerald/50 object-cover ring-1 ring-brand-emerald/30"
            />
          ) : (
            <UserCircle className="w-8 h-8 text-brand-emerald" />
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-emerald ring-2 ring-obsidian-canvas" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold text-obsidian-text truncate">
              {session.user.name || "Admin"}
            </p>
            <ShieldCheck className="w-3 h-3 text-brand-emerald shrink-0" />
          </div>
          <p className="text-[10px] font-mono text-brand-cyan truncate">
            {session.user.email}
          </p>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded border border-obsidian-border hover:border-rose-500/40 hover:bg-rose-500/10 text-obsidian-subtext hover:text-rose-400 text-[11px] font-medium transition-all cursor-pointer"
      >
        <LogOut className="w-3 h-3" />
        Sign Out Session
      </button>
    </div>
  );
}
