"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  GitFork,
  Cloud,
  Plus,
  Trash2,
  Edit2,
  ArrowUpDown,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Layout,
  Boxes,
} from "lucide-react";
import ObsidianModal from "@/components/ObsidianModal";
import ObsidianToast, { ToastMessage } from "@/components/ObsidianToast";

interface TechItem {
  id: string;
  name: string;
  category: "backend" | "frontend" | "framework" | "analysis" | "devops";
  description: string;
  proficiency: number;
  level: "mastery" | "proficient" | "familiar";
  isFeatured: boolean;
}

const INITIAL_SKILLS: TechItem[] = [
  // Core Backend & Database
  {
    id: "1",
    name: "Node.js Engine",
    category: "backend",
    description: "High-throughput runtime, event-driven async workers",
    proficiency: 95,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "2",
    name: "Next.js 14 App Router",
    category: "backend",
    description: "React Server Components, server actions, route handlers",
    proficiency: 92,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "3",
    name: "PostgreSQL (Neon)",
    category: "backend",
    description: "Connection pooling, indexing strategies, strict ACID transactions",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "4",
    name: "Prisma ORM",
    category: "backend",
    description: "Type-safe database queries, schema migrations, relations",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "5",
    name: "REST & GraphQL Architecture",
    category: "backend",
    description: "Scalable API design, spec-first contracts, middleware caching",
    proficiency: 85,
    level: "proficient",
    isFeatured: true,
  },

  // Modern Frontend
  {
    id: "f1",
    name: "React.js Ecosystem",
    category: "frontend",
    description: "Component-driven architecture, custom hooks, virtual DOM optimization",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "f2",
    name: "TypeScript (Frontend)",
    category: "frontend",
    description: "Strict typing, interfaces, generics, type-safe state contracts",
    proficiency: 88,
    level: "proficient",
    isFeatured: true,
  },
  {
    id: "f3",
    name: "Tailwind CSS & Modern Styling",
    category: "frontend",
    description: "Utility-first design tokens, responsive grid/flexbox, dark mode themes",
    proficiency: 92,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "f4",
    name: "Semantic HTML5 & Modern DOM",
    category: "frontend",
    description: "Accessible semantic structure, Core Web Vitals, browser event models",
    proficiency: 95,
    level: "mastery",
    isFeatured: true,
  },

  // Frameworks & Tooling
  {
    id: "fw1",
    name: "Next.js 14 App Router",
    category: "framework",
    description: "React Server Components, server actions, route handlers, dynamic caching",
    proficiency: 92,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "fw2",
    name: "Express.js API Engine",
    category: "framework",
    description: "Middleware routing pipelines, RESTful controllers, CORS & JWT security",
    proficiency: 88,
    level: "proficient",
    isFeatured: true,
  },
  {
    id: "fw3",
    name: "Laravel / PHP Framework",
    category: "framework",
    description: "MVC architecture, Eloquent ORM, Blade templating, service providers",
    proficiency: 82,
    level: "proficient",
    isFeatured: true,
  },
  {
    id: "fw4",
    name: "Prisma ORM & Tooling",
    category: "framework",
    description: "Schema-first modeling, type-safe migrations, connection pooling",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },

  // System Analysis
  {
    id: "6",
    name: "UML Modeling Suite",
    category: "analysis",
    description: "Use-Case Diagrams, Class Modeling, Sequence & Activity Diagrams",
    proficiency: 95,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "7",
    name: "Software Req. Specs (SRS)",
    category: "analysis",
    description: "IEEE 830-compliant functional matrices, traceability",
    proficiency: 92,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "8",
    name: "ERD Schema & Normalization",
    category: "analysis",
    description: "3NF / BCNF relational schemas, foreign key constraints",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "9",
    name: "UAT Testing & Verification",
    category: "analysis",
    description: "Acceptance criteria simulation, edge-case regression matrices",
    proficiency: 88,
    level: "proficient",
    isFeatured: false,
  },

  // Infrastructure & DevOps
  {
    id: "10",
    name: "Docker & Containerization",
    category: "devops",
    description: "Multi-stage builds, isolated networks, immutable runtime",
    proficiency: 88,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "11",
    name: "Redis Caching & Pub/Sub",
    category: "devops",
    description: "In-memory session caching, rate-limiting, message queues",
    proficiency: 85,
    level: "proficient",
    isFeatured: true,
  },
  {
    id: "12",
    name: "GitHub Actions CI/CD",
    category: "devops",
    description: "Automated linting, test suites, Vercel deployments",
    proficiency: 85,
    level: "proficient",
    isFeatured: true,
  },
  {
    id: "13",
    name: "Linux (Ubuntu Server)",
    category: "devops",
    description: "Systemd daemon management, Nginx reverse proxy, SSH hardening",
    proficiency: 82,
    level: "proficient",
    isFeatured: true,
  },
];

export default function ManageSkillsPage() {
  const [skills, setSkills] = useState<TechItem[]>(INITIAL_SKILLS);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // New Tech Form state
  const [editingTech, setEditingTech] = useState<TechItem | null>(null);
  const [newTech, setNewTech] = useState({
    name: "",
    category: "backend" as "backend" | "frontend" | "framework" | "analysis" | "devops",
    description: "",
    proficiency: 85,
    level: "mastery" as "mastery" | "proficient" | "familiar",
    isFeatured: true,
  });

  const addToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Load from LocalStorage + Server Sync
  useEffect(() => {
    try {
      const cached = localStorage.getItem("portfolio_admin_skills");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSkills(parsed);
        }
      }
    } catch (e) {
      console.error("Local storage read error:", e);
    }

    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSkills(data);
          try {
            localStorage.setItem("portfolio_admin_skills", JSON.stringify(data));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => console.error("Error fetching /api/skills:", err));
  }, []);

  const persistSkills = (updatedList: TechItem[]) => {
    setSkills(updatedList);
    try {
      localStorage.setItem("portfolio_admin_skills", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const target = skills.find((s) => s.id === id);
    if (!target) return;
    const newStatus = !target.isFeatured;
    const updated = skills.map((item) => (item.id === id ? { ...item, isFeatured: newStatus } : item));
    persistSkills(updated);

    addToast(
      "info",
      `${target.name} Status Changed`,
      newStatus ? "Ditampilkan di Beranda (Tersimpan Otomatis)" : "Disembunyikan (Tersimpan Otomatis)"
    );

    try {
      await fetch("/api/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFeatured: newStatus }),
      });
    } catch (err) {
      console.error("Failed to sync toggle:", err);
    }
  };

  const handleDeleteTech = async (id: string, name: string) => {
    const updated = skills.filter((item) => item.id !== id);
    persistSkills(updated);
    addToast("error", "Tech Removed", `${name} berhasil dihapus dan tersimpan.`);

    try {
      await fetch(`/api/skills?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to sync delete:", err);
    }
  };

  const handleUpdateTechSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech || !editingTech.name.trim()) return;

    const updated = skills.map((item) => (item.id === editingTech.id ? { ...editingTech } : item));
    persistSkills(updated);
    addToast("success", "Perubahan Tersimpan!", `${editingTech.name} diperbarui secara otomatis.`);

    const techToSave = { ...editingTech };
    setEditingTech(null);

    try {
      await fetch("/api/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(techToSave),
      });
    } catch (err) {
      console.error("Failed to sync update:", err);
    }
  };

  const handleAddTechSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.name.trim()) return;

    const newItem: TechItem = {
      id: Date.now().toString(),
      name: newTech.name.trim(),
      category: newTech.category,
      description: newTech.description.trim() || "Configured in telemetric registry.",
      proficiency: Number(newTech.proficiency),
      level: newTech.level,
      isFeatured: newTech.isFeatured,
    };

    const updated = [newItem, ...skills];
    persistSkills(updated);

    setNewTech({
      name: "",
      category: "backend",
      description: "",
      proficiency: 85,
      level: "mastery",
      isFeatured: true,
    });

    addToast("success", "Teknologi Baru Ditambahkan!", `${newItem.name} tersimpan otomatis.`);

    try {
      await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
    } catch (err) {
      console.error("Failed to sync add:", err);
    }
  };

  const backendSkills = skills.filter((s) => s.category === "backend");
  const frontendSkills = skills.filter((s) => s.category === "frontend");
  const frameworkSkills = skills.filter((s) => s.category === "framework");
  const analysisSkills = skills.filter((s) => s.category === "analysis");
  const devopsSkills = skills.filter((s) => s.category === "devops");

  return (
    <div className="space-y-8">
      <ObsidianToast toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-obsidian-subtext">
            <span>CMS</span>
            <span>/</span>
            <span className="text-white">TECH REGISTRY</span>
            <span>/</span>
            <span className="text-brand-emerald">Production Stack Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Skills & Technology Stack
          </h1>
          <p className="text-xs text-obsidian-subtext font-mono">
            Manage architectural proficiencies, system analysis standards, and tech stack registry prioritization.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={() => setIsReorderModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Reorder Categories</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Skills List (Left 7 cols) & Register Form (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Categories and Tech Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category 1: Core Backend & Database */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
                  <Server className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-white">
                  Core Backend & Database
                </h3>
              </div>
              <span className="font-mono text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                {backendSkills.length} ACTIVE STACK
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {backendSkills.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3.5 rounded-md border border-obsidian-border bg-obsidian-void/70 hover:bg-obsidian-void space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {tech.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          tech.level === "mastery"
                            ? "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30"
                            : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30"
                        }`}
                      >
                        {tech.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(tech.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          tech.isFeatured ? "bg-brand-emerald" : "bg-obsidian-border"
                        }`}
                        title={
                          tech.isFeatured ? "Visible on Homepage" : "Hidden from Homepage"
                        }
                      >
                        <span
                          className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                            tech.isFeatured ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingTech(tech)}
                        className="text-obsidian-muted hover:text-brand-cyan transition-colors"
                        title="Edit technology"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTech(tech.id, tech.name)}
                        className="text-obsidian-muted hover:text-rose-400 transition-colors"
                        title="Delete tech"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-obsidian-subtext font-sans leading-relaxed">
                    {tech.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-obsidian-card rounded-full overflow-hidden border border-obsidian-border">
                      <div
                        style={{ width: `${tech.proficiency}%` }}
                        className="h-full bg-brand-emerald rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-obsidian-subtext">
                      {tech.proficiency}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category 2: Frontend Engineering */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                  <Layout className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-white">
                  Frontend Engineering
                </h3>
              </div>
              <span className="font-mono text-[10px] text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/30">
                {frontendSkills.length} ACTIVE UI
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {frontendSkills.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3.5 rounded-md border border-obsidian-border bg-obsidian-void/70 hover:bg-obsidian-void space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {tech.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          tech.level === "mastery"
                            ? "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30"
                            : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30"
                        }`}
                      >
                        {tech.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(tech.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          tech.isFeatured ? "bg-brand-emerald" : "bg-obsidian-border"
                        }`}
                        title={
                          tech.isFeatured ? "Visible on Homepage" : "Hidden from Homepage"
                        }
                      >
                        <span
                          className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                            tech.isFeatured ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingTech(tech)}
                        className="text-obsidian-muted hover:text-brand-cyan transition-colors"
                        title="Edit technology"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTech(tech.id, tech.name)}
                        className="text-obsidian-muted hover:text-rose-400 transition-colors"
                        title="Delete tech"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-obsidian-subtext font-sans leading-relaxed">
                    {tech.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-obsidian-card rounded-full overflow-hidden border border-obsidian-border">
                      <div
                        style={{ width: `${tech.proficiency}%` }}
                        className="h-full bg-brand-cyan rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-obsidian-subtext">
                      {tech.proficiency}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category 3: Frameworks & Tooling */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-white">
                  Frameworks & Tooling
                </h3>
              </div>
              <span className="font-mono text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                {frameworkSkills.length} ACTIVE FRAMEWORK
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {frameworkSkills.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3.5 rounded-md border border-obsidian-border bg-obsidian-void/70 hover:bg-obsidian-void space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {tech.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          tech.level === "mastery"
                            ? "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30"
                            : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30"
                        }`}
                      >
                        {tech.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(tech.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          tech.isFeatured ? "bg-brand-emerald" : "bg-obsidian-border"
                        }`}
                        title={
                          tech.isFeatured ? "Visible on Homepage" : "Hidden from Homepage"
                        }
                      >
                        <span
                          className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                            tech.isFeatured ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingTech(tech)}
                        className="text-obsidian-muted hover:text-brand-cyan transition-colors"
                        title="Edit technology"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTech(tech.id, tech.name)}
                        className="text-obsidian-muted hover:text-rose-400 transition-colors"
                        title="Delete tech"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-obsidian-subtext font-sans leading-relaxed">
                    {tech.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-obsidian-card rounded-full overflow-hidden border border-obsidian-border">
                      <div
                        style={{ width: `${tech.proficiency}%` }}
                        className="h-full bg-brand-emerald rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-obsidian-subtext">
                      {tech.proficiency}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category 4: System Analysis & Architecture */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                  <GitFork className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-white">
                  System Analysis & Architecture
                </h3>
              </div>
              <span className="font-mono text-[10px] text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/30">
                {analysisSkills.length} ACTIVE SPEC
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {analysisSkills.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3.5 rounded-md border border-obsidian-border bg-obsidian-void/70 hover:bg-obsidian-void space-y-2 flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        {tech.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingTech(tech)}
                          className="text-obsidian-muted hover:text-brand-cyan transition-colors"
                          title="Edit specification"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTech(tech.id, tech.name)}
                          className="text-obsidian-muted hover:text-rose-400 transition-colors"
                          title="Delete specification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-obsidian-subtext font-sans line-clamp-2">
                      {tech.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-obsidian-border/60">
                    <span className="text-[10px] text-brand-cyan">
                      {tech.proficiency}% proficiency
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(tech.id)}
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                        tech.isFeatured
                          ? "text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/30"
                          : "text-obsidian-muted bg-obsidian-card"
                      }`}
                    >
                      {tech.isFeatured ? "Featured" : "Hidden"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category 3: Infrastructure & DevOps */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-white">
                  Infrastructure & DevOps
                </h3>
              </div>
              <span className="font-mono text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                {devopsSkills.length} ACTIVE INFRA
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {devopsSkills.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3.5 rounded-md border border-obsidian-border bg-obsidian-void/70 hover:bg-obsidian-void flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs truncate">
                        {tech.name}
                      </span>
                      <span className="text-[9px] font-mono text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.2 rounded border border-brand-emerald/30">
                        {tech.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-obsidian-subtext font-sans truncate">
                      {tech.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(tech.id)}
                      className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                        tech.isFeatured ? "bg-brand-emerald" : "bg-obsidian-border"
                      }`}
                    >
                      <span
                        className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                          tech.isFeatured ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTech(tech)}
                      className="text-obsidian-muted hover:text-brand-cyan transition-colors"
                      title="Edit infrastructure tech"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTech(tech.id, tech.name)}
                      className="text-obsidian-muted hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Register New Tech Form */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-5 lg:sticky lg:top-20 font-mono text-xs">
          <div className="space-y-1 pb-3 border-b border-obsidian-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-emerald" />
                Register New Tech
              </h3>
              <span className="text-[10px] text-brand-emerald">
                Auto-Indexing Active
              </span>
            </div>
            <p className="text-[11px] text-obsidian-subtext">
              Append stack competencies directly to portfolio visualization.
            </p>
          </div>

          <form onSubmit={handleAddTechSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Tech Name *
              </label>
              <input
                type="text"
                required
                value={newTech.name}
                onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                placeholder="e.g. Apache Kafka, Turborepo"
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Target Category *
              </label>
              <select
                value={newTech.category}
                onChange={(e) =>
                  setNewTech({
                    ...newTech,
                    category: e.target.value as "backend" | "frontend" | "framework" | "analysis" | "devops",
                  })
                }
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              >
                <option value="backend">Core Backend & Database</option>
                <option value="frontend">Frontend Engineering</option>
                <option value="framework">Frameworks & Tooling</option>
                <option value="analysis">System Analysis & Architecture</option>
                <option value="devops">Infrastructure & DevOps</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Proficiency Tier
                </label>
                <select
                  value={newTech.level}
                  onChange={(e) =>
                    setNewTech({
                      ...newTech,
                      level: e.target.value as "mastery" | "proficient" | "familiar",
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                >
                  <option value="mastery">Mastery</option>
                  <option value="proficient">Proficient</option>
                  <option value="familiar">Familiar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Benchmark Metric (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newTech.proficiency}
                  onChange={(e) =>
                    setNewTech({ ...newTech, proficiency: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Description / Technical Focus
              </label>
              <textarea
                rows={3}
                value={newTech.description}
                onChange={(e) =>
                  setNewTech({ ...newTech, description: e.target.value })
                }
                placeholder="Key role in microservices, schema normalization, or cluster workflows..."
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="isFeatured"
                checked={newTech.isFeatured}
                onChange={(e) =>
                  setNewTech({ ...newTech, isFeatured: e.target.checked })
                }
                className="w-4 h-4 rounded border-obsidian-border bg-obsidian-void text-brand-emerald focus:ring-brand-emerald"
              />
              <label
                htmlFor="isFeatured"
                className="text-xs text-obsidian-text select-none cursor-pointer"
              >
                Feature on Public Portfolio Homepage
              </label>
            </div>

            <div className="pt-3 border-t border-obsidian-border">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Insert into Telemetric Registry</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal: Reorder Categories */}
      <ObsidianModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        title="Reorder Technology Categories"
        subtitle="Adjust priority order of domain categories on the public viewport"
        maxWidth="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-obsidian-subtext text-xs leading-relaxed">
            Drag or toggle ordering positions to adjust which domain is rendered first in the Structured Engineering Arsenal section.
          </p>

          <div className="space-y-2">
            {[
              { title: "Core Backend & Database", priority: "Priority 1 (Top)" },
              { title: "Frontend Engineering", priority: "Priority 2" },
              { title: "Frameworks & Tooling", priority: "Priority 3" },
              { title: "System Analysis & Architecture", priority: "Priority 4" },
              { title: "Infrastructure & DevOps", priority: "Priority 5" },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-md border border-obsidian-border bg-obsidian-card"
              >
                <span className="font-semibold text-white">{cat.title}</span>
                <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                  {cat.priority}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-obsidian-border flex justify-end">
            <button
              onClick={() => {
                setIsReorderModalOpen(false);
                addToast("success", "Category Order Saved", "Public viewports updated.");
              }}
              type="button"
              className="px-4 py-2 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-bold text-xs transition-all"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </ObsidianModal>

      {/* Modal: Edit Tech */}
      <ObsidianModal
        isOpen={Boolean(editingTech)}
        onClose={() => setEditingTech(null)}
        title="Edit Technology Stack"
        subtitle={`Modify specification & proficiency metrics for ${editingTech?.name || ""}`}
        maxWidth="md"
      >
        {editingTech && (
          <form onSubmit={handleUpdateTechSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Tech Name *
              </label>
              <input
                type="text"
                required
                value={editingTech.name}
                onChange={(e) => setEditingTech({ ...editingTech, name: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Target Category *
              </label>
              <select
                value={editingTech.category}
                onChange={(e) =>
                  setEditingTech({
                    ...editingTech,
                    category: e.target.value as "backend" | "frontend" | "framework" | "analysis" | "devops",
                  })
                }
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              >
                <option value="backend">Core Backend & Database</option>
                <option value="frontend">Frontend Engineering</option>
                <option value="framework">Frameworks & Tooling</option>
                <option value="analysis">System Analysis & Architecture</option>
                <option value="devops">Infrastructure & DevOps</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Proficiency Tier
                </label>
                <select
                  value={editingTech.level}
                  onChange={(e) =>
                    setEditingTech({
                      ...editingTech,
                      level: e.target.value as "mastery" | "proficient" | "familiar",
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                >
                  <option value="mastery">Mastery</option>
                  <option value="proficient">Proficient</option>
                  <option value="familiar">Familiar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Benchmark Metric (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={editingTech.proficiency}
                  onChange={(e) =>
                    setEditingTech({ ...editingTech, proficiency: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Description / Technical Focus
              </label>
              <textarea
                rows={3}
                value={editingTech.description}
                onChange={(e) =>
                  setEditingTech({ ...editingTech, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="editIsFeatured"
                checked={editingTech.isFeatured}
                onChange={(e) =>
                  setEditingTech({ ...editingTech, isFeatured: e.target.checked })
                }
                className="w-4 h-4 rounded border-obsidian-border bg-obsidian-void text-brand-emerald focus:ring-brand-emerald"
              />
              <label
                htmlFor="editIsFeatured"
                className="text-xs text-obsidian-text select-none cursor-pointer"
              >
                Feature on Public Portfolio Homepage
              </label>
            </div>

            <div className="pt-4 border-t border-obsidian-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTech(null)}
                className="px-4 py-2 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-brand-cyan hover:bg-sky-400 text-obsidian-void font-bold text-xs transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </ObsidianModal>
    </div>
  );
}
