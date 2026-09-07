import {
  Server,
  Database,
  GitFork,
  Cloud,
  Shield,
  Zap,
  ArrowUpRight,
  Github,
  FileDown,
  BadgeCheck,
  CheckCircle2,
  Terminal,
  ExternalLink,
  MapPin,
  Layout,
  Boxes,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSkills, getExperience, getCertifications } from "@/lib/storage";
import TrackedLink from "@/components/TrackedLink";
import CopyEmailButton from "@/components/CopyEmailButton";
import ProjectDetailTrigger from "@/components/ProjectDetailTrigger";
import CertificateViewTrigger from "@/components/CertificateViewTrigger";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  let publishedProjects: Array<{
    id: string;
    title: string;
    slug: string;
    badge?: string | null;
    description: string;
    thumbnail: string | null;
    videoUrl?: string | null;
    techStack: string[];
    repoUrl?: string | null;
    liveUrl?: string | null;
    gallery?: string[];
    documentUrl?: string | null;
    completedAt?: Date | null;
    isFeatured?: boolean | null;
    createdAt?: Date;
  }> = [];

  let profile: {
    name?: string | null;
    avatarUrl?: string | null;
    heroTitle?: string | null;
    aboutText?: string | null;
    emailContact?: string | null;
    resumeUrl?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    location?: string | null;
  } | null = null;

  try {
    const [fetchedProjects, fetchedProfile] = await Promise.all([
      prisma.project.findMany({
        where: { isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.profile.findFirst({
        where: { id: 1 },
      }),
    ]);
    publishedProjects = fetchedProjects;
    profile = fetchedProfile;
  } catch (error) {
    console.error("Error fetching homepage public data:", error);
  }

  const heroTitle =
    profile?.heroTitle ||
    "Engineering Scalable Systems & High-Throughput Backends";
  const bioText =
    profile?.aboutText ||
    "Information Systems background specializing in Backend Architecture, PostgreSQL, query optimization, System Analysis (UML/SRS), and automated cloud infrastructure.";
  const contactEmail = profile?.emailContact || "zola.engineer@kontak.dev";
  const resumeUrl = profile?.resumeUrl || "#";
  const githubUrl = profile?.githubUrl || "https://github.com";
  const linkedinUrl = profile?.linkedinUrl || "https://linkedin.com";

  const storedSkills = getSkills();
  const backendSkills = storedSkills.filter((s) => s.category === "backend" && s.isFeatured);
  const frontendSkills = storedSkills.filter((s) => s.category === "frontend" && s.isFeatured);
  const frameworkSkills = storedSkills.filter((s) => s.category === "framework" && s.isFeatured);
  const analysisSkills = storedSkills.filter((s) => s.category === "analysis" && s.isFeatured);
  const devopsSkills = storedSkills.filter((s) => s.category === "devops" && s.isFeatured);

  const storedExperience = getExperience().filter((e) => e.isPublished !== false);
  const storedCertifications = getCertifications();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-28">
      {/* ========================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================= */}
      <section id="about" className="text-center space-y-8 relative">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Status Tag & Location */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-mono font-medium shadow-sm shadow-brand-emerald/10">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span>Open to Engineering & Technical Roles</span>
          </div>
          {profile?.location && (
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-obsidian-subtext px-2.5 py-1 rounded-full bg-obsidian-card/60 border border-obsidian-border">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Avatar with double-ring halo & active beacon */}
        <div className="flex justify-center">
          <div className="relative p-1 rounded-full bg-gradient-to-b from-white/20 via-obsidian-highlight to-transparent transition-transform duration-300 hover:scale-105">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-obsidian-card border border-obsidian-border flex items-center justify-center overflow-hidden shadow-2xl relative group">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || "Zola Dimas Firmansyah"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-obsidian-card via-obsidian-canvas to-obsidian-void flex items-center justify-center font-mono font-bold text-2xl text-obsidian-text">
                  ZD
                </div>
              )}
              <span className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-brand-emerald ring-4 ring-obsidian-void shadow-lg shadow-brand-emerald/50" />
            </div>
          </div>
        </div>

        {/* Headline & Subtitle */}
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-sm font-mono text-brand-emerald font-semibold uppercase tracking-wider">
            {profile?.name || "Zola Dimas Firmansyah"}
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
            {heroTitle}
          </h1>
          <p className="text-obsidian-subtext text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            {bioText}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {resumeUrl && (
            <TrackedLink
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-semibold text-xs transition-all shadow-md hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Resume / CV</span>
            </TrackedLink>
          )}

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-obsidian-border hover:border-obsidian-border-focus bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Github className="w-4 h-4" />
            <span>GitHub 240+</span>
          </a>
        </div>

        {/* Telemetry Metric Ribbon */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-obsidian-subtext border-t border-obsidian-border/70 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-card/40 border border-obsidian-border hover:border-brand-emerald/40 hover-lift cursor-default transition-colors">
            <Shield className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Production Deployed</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-card/40 border border-obsidian-border hover:border-brand-cyan/40 hover-lift cursor-default transition-colors">
            <Zap className="w-3.5 h-3.5 text-brand-cyan" />
            <span>End-to-End Solutions</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-card/40 border border-obsidian-border hover:border-brand-emerald-dim/40 hover-lift cursor-default transition-colors">
            <Database className="w-3.5 h-3.5 text-brand-emerald-dim" />
            <span>Real-world Impact</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: STRUCTURED ENGINEERING ARSENAL */}
      {/* ========================================================= */}
      <section id="skills" className="space-y-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/25 font-mono text-xs uppercase tracking-widest text-brand-emerald">
            <span>Domain Competencies</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Structured Engineering Arsenal
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Core Backend */}
          <div className="p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-4 hover:border-brand-emerald/40 transition-all group">
            <div className="w-9 h-9 rounded-md bg-obsidian-card border border-obsidian-border group-hover:border-brand-emerald/40 flex items-center justify-center text-brand-emerald transition-colors">
              <Server className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-white group-hover:text-brand-emerald-dim transition-colors">Core Backend</h3>
              <p className="text-xs text-obsidian-subtext leading-relaxed">
                High-throughput API microservices, query optimization, robust database layers, and ACID transactions.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {backendSkills.map((skill) => (
                <span
                  key={skill.id}
                  className={
                    skill.level === "mastery" || skill.proficiency >= 90
                      ? "px-2 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/30 text-[11px] font-mono text-brand-emerald-dim hover:bg-brand-emerald/20 hover:border-brand-emerald/50 transition-colors cursor-default"
                      : "px-2 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-[11px] font-mono text-obsidian-text hover:bg-obsidian-highlight hover:border-obsidian-border-focus transition-colors cursor-default"
                  }
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Modern Frontend */}
          <div className="p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-4 hover:border-brand-cyan/40 transition-all group">
            <div className="w-9 h-9 rounded-md bg-obsidian-card border border-obsidian-border group-hover:border-brand-cyan/40 flex items-center justify-center text-brand-cyan transition-colors">
              <Layout className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-white group-hover:text-brand-cyan-dim transition-colors">Modern Frontend</h3>
              <p className="text-xs text-obsidian-subtext leading-relaxed">
                Clean component architecture, responsive mobile-first layouts, intuitive UI/UX, and seamless API consumption.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {frontendSkills.map((skill) => (
                <span
                  key={skill.id}
                  className={
                    skill.level === "mastery" || skill.proficiency >= 90
                      ? "px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-[11px] font-mono text-brand-cyan-dim hover:bg-brand-cyan/20 hover:border-brand-cyan/50 transition-colors cursor-default"
                      : "px-2 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-[11px] font-mono text-obsidian-text hover:bg-obsidian-highlight hover:border-obsidian-border-focus transition-colors cursor-default"
                  }
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Frameworks & Tooling */}
          <div className="p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-4 hover:border-brand-emerald/40 transition-all group">
            <div className="w-9 h-9 rounded-md bg-obsidian-card border border-obsidian-border group-hover:border-brand-emerald/40 flex items-center justify-center text-brand-emerald transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-white group-hover:text-brand-emerald-dim transition-colors">Frameworks & Tooling</h3>
              <p className="text-xs text-obsidian-subtext leading-relaxed">
                Modern fullstack frameworks, MVC architectures, modular libraries, and rapid development toolchains.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {frameworkSkills.map((skill) => (
                <span
                  key={skill.id}
                  className={
                    skill.level === "mastery" || skill.proficiency >= 90
                      ? "px-2 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/30 text-[11px] font-mono text-brand-emerald-dim hover:bg-brand-emerald/20 hover:border-brand-emerald/50 transition-colors cursor-default"
                      : "px-2 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-[11px] font-mono text-obsidian-text hover:bg-obsidian-highlight hover:border-obsidian-border-focus transition-colors cursor-default"
                  }
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: System Analysis */}
          <div className="p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-4 hover:border-brand-cyan/40 transition-all group">
            <div className="w-9 h-9 rounded-md bg-obsidian-card border border-obsidian-border group-hover:border-brand-cyan/40 flex items-center justify-center text-brand-cyan transition-colors">
              <GitFork className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-white group-hover:text-brand-cyan-dim transition-colors">System Analysis</h3>
              <p className="text-xs text-obsidian-subtext leading-relaxed">
                Enterprise systems evaluation via requirements engineering, architecture blueprints, and strict schema standards.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {analysisSkills.map((skill) => (
                <span
                  key={skill.id}
                  className={
                    skill.level === "mastery" || skill.proficiency >= 90
                      ? "px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-[11px] font-mono text-brand-cyan-dim hover:bg-brand-cyan/20 hover:border-brand-cyan/50 transition-colors cursor-default"
                      : "px-2 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-[11px] font-mono text-obsidian-text hover:bg-obsidian-highlight hover:border-obsidian-border-focus transition-colors cursor-default"
                  }
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Card 5: Infra & DevOps */}
          <div className="p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-4 hover:border-brand-emerald/40 transition-all group">
            <div className="w-9 h-9 rounded-md bg-obsidian-card border border-obsidian-border group-hover:border-brand-emerald/40 flex items-center justify-center text-brand-emerald transition-colors">
              <Cloud className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-white group-hover:text-brand-emerald-dim transition-colors">Infra & DevOps</h3>
              <p className="text-xs text-obsidian-subtext leading-relaxed">
                Containerized execution environments, automated routing, healthchecks, and immutable deployments.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {devopsSkills.map((skill) => (
                <span
                  key={skill.id}
                  className={
                    skill.level === "mastery" || skill.proficiency >= 90
                      ? "px-2 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/30 text-[11px] font-mono text-brand-emerald-dim hover:bg-brand-emerald/20 hover:border-brand-emerald/50 transition-colors cursor-default"
                      : "px-2 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-[11px] font-mono text-obsidian-text hover:bg-obsidian-highlight hover:border-obsidian-border-focus transition-colors cursor-default"
                  }
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: TRACK RECORD & IMPACT */}
      {/* ========================================================= */}
      <section id="experience" className="space-y-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/25 font-mono text-xs uppercase tracking-widest text-brand-emerald">
            <span>Commercial & Gov Track Record</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Track Record & Impact
          </h2>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l border-obsidian-border/80 hover:border-brand-emerald/30 transition-colors space-y-8">
          {storedExperience.map((item, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const dotBorderColor = isFirst
              ? "border-brand-emerald"
              : isSecond
                ? "border-brand-cyan"
                : "border-obsidian-muted";
            const badgeStyle = isFirst
              ? "bg-brand-emerald/10 text-brand-emerald-dim border-brand-emerald/30"
              : isSecond
                ? "bg-brand-cyan/10 text-brand-cyan-dim border-brand-cyan/30"
                : "bg-obsidian-card text-obsidian-subtext border-obsidian-border";

            return (
              <div key={item.id} className="relative group">
                <span
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-obsidian-void border-2 ${dotBorderColor} ring-4 ring-obsidian-void group-hover:scale-125 group-hover:ring-brand-emerald/30 transition-all duration-300`}
                />
                <div className="p-5 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-2.5 group-hover:border-obsidian-border-focus transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-white">
                      {item.role} — {item.organization}
                    </h3>
                    <span className={`px-2 py-0.5 rounded border font-mono text-[10px] ${badgeStyle}`}>
                      {item.location ? `${item.location} | ` : ""}{item.period}
                    </span>
                  </div>
                  <p className="text-xs text-obsidian-subtext leading-relaxed">
                    {item.description}
                  </p>
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-card text-obsidian-subtext border border-obsidian-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: REAL-WORLD IMPLEMENTATIONS (BENTO GRID) */}
      {/* ========================================================= */}
      <section id="projects" className="space-y-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/25 font-mono text-xs uppercase tracking-widest text-brand-emerald">
            <span>Production Deployments</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Real-World Implementations
          </h2>
        </div>

        {/* Dynamic Database Projects (Zero Dummy Data) */}
        {publishedProjects.length === 0 ? (
          <div className="p-12 rounded-lg border border-obsidian-border bg-obsidian-canvas text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-obsidian-card border border-obsidian-border flex items-center justify-center mx-auto text-obsidian-muted">
              <Boxes className="w-6 h-6 text-brand-emerald" />
            </div>
            <h3 className="text-base font-semibold text-white">No Public Deployments Yet</h3>
            <p className="text-xs text-obsidian-subtext font-mono max-w-md mx-auto">
              Production architecture blueprints and live case studies will appear here once published from the admin console.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {publishedProjects.map((project, idx) => {
              const isFeatured = idx === 0;

              if (isFeatured) {
                return (
                  <div
                    key={project.id}
                    className="md:col-span-2 p-6 sm:p-8 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-6 hover:border-brand-emerald/40 transition-all group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/30 font-mono text-[11px] text-brand-emerald-dim inline-flex items-center gap-1.5">
                        {project.isFeatured && (
                          <Star className="w-3 h-3 fill-brand-emerald text-brand-emerald animate-pulse" />
                        )}
                        <span>{project.badge || "FEATURED PRODUCTION ARCHITECTURE"}</span>
                      </span>
                      {project.completedAt ? (
                        <span className="text-xs font-mono text-obsidian-muted">
                          {new Date(project.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-obsidian-muted">
                          Production Deployment
                        </span>
                      )}
                    </div>

                    {/* Thumbnail if present */}
                    {project.thumbnail && (
                      <div className="w-full max-h-80 sm:max-h-96 rounded-md overflow-hidden bg-obsidian-void border border-obsidian-border group/img relative">
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full max-h-80 sm:max-h-96 object-cover object-top group-hover/img:scale-[1.02] transition-transform duration-700 ease-out"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-brand-emerald-dim transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-obsidian-subtext leading-relaxed">
                          {project.description}
                        </p>

                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {project.techStack.map((tech, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-xs font-mono px-2.5 py-1 rounded bg-obsidian-card border border-obsidian-border text-obsidian-text hover:border-brand-emerald/40 hover:bg-obsidian-highlight transition-all cursor-default"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-obsidian-border/80">
                      <ProjectDetailTrigger
                        project={project}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-white/20 group/btn"
                      >
                        <span>View Architecture Blueprint</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </ProjectDetailTrigger>

                      {project.repoUrl && (
                        <TrackedLink
                          href={project.repoUrl}
                          projectId={project.id}
                          className="inline-flex items-center gap-1.5 text-xs text-obsidian-subtext hover:text-white transition-colors font-mono hover:scale-[1.02]"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Source Code</span>
                          <ArrowUpRight className="w-3 h-3 text-obsidian-muted" />
                        </TrackedLink>
                      )}

                      {project.liveUrl && (
                        <TrackedLink
                          href={project.liveUrl}
                          projectId={project.id}
                          className="inline-flex items-center gap-1.5 text-brand-cyan hover:text-brand-cyan-dim transition-colors font-mono hover:scale-[1.02]"
                        >
                          <span>Live Demo</span>
                          <ArrowUpRight className="w-3 h-3 text-brand-cyan" />
                        </TrackedLink>
                      )}

                      <a
                        href="#contact"
                        className="inline-flex items-center gap-1.5 text-xs text-obsidian-subtext hover:text-white transition-colors font-mono hover:scale-[1.02]"
                      >
                        <span>Request Consultation</span>
                        <ArrowUpRight className="w-3 h-3 text-obsidian-muted" />
                      </a>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={project.id}
                  className="p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-4 hover:border-brand-cyan/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {project.thumbnail && (
                      <div className="h-44 w-full rounded-md overflow-hidden bg-obsidian-void border border-obsidian-border group/img relative">
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover object-top group-hover/img:scale-[1.03] transition-transform duration-500 ease-out"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 font-mono text-[10px] text-brand-cyan-dim">
                        {project.badge || "PRODUCTION SYSTEM"}
                      </span>
                      {project.completedAt ? (
                        <span className="text-[11px] font-mono text-obsidian-muted">
                          {new Date(project.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-brand-emerald">
                          Published
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-cyan-dim transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-obsidian-subtext leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.techStack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-obsidian-text hover:border-brand-cyan/40 hover:bg-obsidian-highlight transition-all cursor-default"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-obsidian-border/80 text-xs font-mono">
                    <ProjectDetailTrigger
                      project={project}
                      className="inline-flex items-center gap-1 text-brand-emerald hover:text-white transition-colors group/link"
                    >
                      <span>View Blueprint & Specs</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </ProjectDetailTrigger>
                    {project.repoUrl && (
                      <TrackedLink
                        projectId={project.id}
                        href={project.repoUrl}
                        className="inline-flex items-center gap-1 text-obsidian-subtext hover:text-white transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </TrackedLink>
                    )}
                    {project.liveUrl && (
                      <TrackedLink
                        projectId={project.id}
                        href={project.liveUrl}
                        className="inline-flex items-center gap-1 text-brand-cyan hover:text-brand-cyan-dim transition-colors"
                      >
                        <span>Live Demo</span>
                        <ArrowUpRight className="w-3 h-3 text-brand-cyan" />
                      </TrackedLink>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: ACCREDITATION & SPECIALIZED MASTERY */}
      {/* ========================================================= */}
      <section id="certifications" className="space-y-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/25 font-mono text-xs uppercase tracking-widest text-brand-emerald">
            <span>Accredited Credentials</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Accreditation & Specialized Mastery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {storedCertifications.map((cert, index) => {
            const isCyan = index % 2 === 1;
            const iconColor = isCyan ? "text-brand-cyan" : "text-brand-emerald";
            const subtextColor = isCyan ? "text-brand-cyan-dim" : "text-brand-emerald-dim";

            return (
              <div
                key={cert.id}
                className="p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow hover-lift space-y-4 hover:border-obsidian-border-focus transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className={`w-8 h-8 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-white/90 transition-colors">
                    {cert.title}
                  </h3>
                  <p className={`text-[11px] font-mono ${subtextColor}`}>
                    {cert.issuer}
                  </p>
                  {cert.description && (
                    <p className="text-xs text-obsidian-subtext leading-relaxed">
                      {cert.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-obsidian-border/80 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs text-obsidian-subtext font-mono">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${iconColor}`} />
                    <span>Verified Credential</span>
                  </div>
                  <CertificateViewTrigger cert={cert} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: COLLABORATION & INTERACTIVE CONTACT */}
      {/* ========================================================= */}
      <section
        id="contact"
        className="p-8 sm:p-12 rounded-xl border border-white/[0.08] bg-obsidian-canvas card-radial-glow hover-lift text-center space-y-6 relative overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-10 h-10 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center text-brand-emerald mx-auto shadow-lg relative z-10">
          <Terminal className="w-5 h-5" />
        </div>

        <div className="max-w-xl mx-auto space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Let&apos;s collaborate on building robust web applications and ensuring software quality.
          </h2>
          <p className="text-xs sm:text-sm text-obsidian-subtext leading-relaxed">
            Currently seeking opportunities to contribute to application development, software testing, and networking within a professional environment.
          </p>
        </div>

        <div className="pt-2 flex justify-center relative z-10">
          <CopyEmailButton email={contactEmail} />
        </div>

        <div className="pt-6 flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-obsidian-subtext border-t border-obsidian-border/60 max-w-md mx-auto relative z-10">
          <a
            href={"https://github.com/Sukron1632"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white px-3 py-1.5 rounded-full bg-obsidian-card/50 border border-obsidian-border hover:border-white/20 transition-all inline-flex items-center gap-1.5"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Profile</span>
          </a>
          <span className="text-obsidian-border">•</span>
          <a
            href={"https://www.linkedin.com/in/zola-firmansyah-444b62336/"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white px-3 py-1.5 rounded-full bg-obsidian-card/50 border border-obsidian-border hover:border-white/20 transition-all inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>LinkedIn Profile</span>
          </a>
        </div>
      </section>
    </div>
  );
}
