"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Milestone,
  BadgeCheck,
  UserCog,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard (Analytics)",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Manage Projects",
    href: "/admin/projects",
    icon: FolderGit2,
  },
  {
    label: "Manage Skills & Stack",
    href: "/admin/skills",
    icon: Cpu,
  },
  {
    label: "Experience & Timeline",
    href: "/admin/experience",
    icon: Milestone,
  },
  {
    label: "Certifications & Credentials",
    href: "/admin/certifications",
    icon: BadgeCheck,
  },
  {
    label: "Profile & Bio CMS",
    href: "/admin/profile",
    icon: UserCog,
  },
  {
    label: "System Settings & Database",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 font-mono text-xs">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all ${
              isActive
                ? "bg-brand-emerald/10 text-white font-medium border border-brand-emerald/30 shadow-sm shadow-brand-emerald/10"
                : "text-obsidian-subtext hover:text-white hover:bg-obsidian-highlight border border-transparent hover:border-obsidian-border"
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive ? "text-brand-emerald" : "text-obsidian-muted"
              }`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
