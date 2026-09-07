import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      writeJsonFile(filename, fallback);
      return fallback;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return fallback;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

// -------------------------------------------------------------
// 1. SKILLS STORAGE
// -------------------------------------------------------------
export interface TechItem {
  id: string;
  name: string;
  category: "backend" | "frontend" | "framework" | "analysis" | "devops";
  description: string;
  proficiency: number;
  level: "mastery" | "proficient" | "familiar";
  isFeatured: boolean;
  order?: number;
}

const DEFAULT_SKILLS: TechItem[] = [
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
    name: "PostgreSQL & MySQL",
    category: "backend",
    description: "Connection pooling, relational indexing, strict ACID transactions",
    proficiency: 92,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "3",
    name: "Prisma ORM",
    category: "backend",
    description: "Type-safe database queries, schema migrations, relation modeling",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "4",
    name: "REST & GraphQL Architecture",
    category: "backend",
    description: "Scalable API design, spec-first contracts, middleware caching",
    proficiency: 88,
    level: "proficient",
    isFeatured: true,
  },
  {
    id: "5",
    name: "API Middleware & Security",
    category: "backend",
    description: "Rate-limiting, CORS, JWT session authentication, input validation",
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
    name: "TypeScript",
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
    name: "HTML5 & Modern Web APIs",
    category: "frontend",
    description: "Accessible semantic structure, Core Web Vitals, browser event models",
    proficiency: 95,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "f5",
    name: "Responsive Mobile-First UI/UX",
    category: "frontend",
    description: "Adaptive layouts, touch interactions, micro-animations, glassmorphism",
    proficiency: 90,
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
    name: "Laravel (PHP)",
    category: "framework",
    description: "MVC architecture, Eloquent ORM, Blade templating, service providers",
    proficiency: 82,
    level: "proficient",
    isFeatured: true,
  },
  {
    id: "fw4",
    name: "NextAuth.js",
    category: "framework",
    description: "Secure session JWT cookies, OAuth 2.0 Google Provider, route gates",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },
  {
    id: "fw5",
    name: "Lucide & UI Tooling",
    category: "framework",
    description: "Vector iconography, design tokens, modular component libraries",
    proficiency: 92,
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
    name: "DFD Process Modeling",
    category: "analysis",
    description: "Data Flow Diagrams Level 0-2, data store dictionaries",
    proficiency: 88,
    level: "proficient",
    isFeatured: true,
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
  {
    id: "14",
    name: "Vercel / Edge Runtime",
    category: "devops",
    description: "Serverless edge functions, global CDN caching, zero-downtime deploys",
    proficiency: 90,
    level: "mastery",
    isFeatured: true,
  },
];

export function getSkills(): TechItem[] {
  return readJsonFile<TechItem[]>("skills.json", DEFAULT_SKILLS);
}

export function saveSkills(skills: TechItem[]): void {
  writeJsonFile("skills.json", skills);
}

export function addSkill(skill: Omit<TechItem, "id"> & { id?: string }): TechItem {
  const skills = getSkills();
  const newSkill: TechItem = {
    ...skill,
    id: skill.id || Date.now().toString(),
  };
  skills.unshift(newSkill);
  saveSkills(skills);
  return newSkill;
}

export function updateSkill(id: string, updates: Partial<TechItem>): TechItem | null {
  const skills = getSkills();
  const index = skills.findIndex((s) => s.id === id);
  if (index === -1) return null;
  skills[index] = { ...skills[index], ...updates };
  saveSkills(skills);
  return skills[index];
}

export function deleteSkill(id: string): boolean {
  const skills = getSkills();
  const filtered = skills.filter((s) => s.id !== id);
  if (filtered.length === skills.length) return false;
  saveSkills(filtered);
  return true;
}

// -------------------------------------------------------------
// 2. EXPERIENCE / CAREER STORAGE
// -------------------------------------------------------------
export interface CareerRecord {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  type: "Internship" | "Contract" | "Full-time" | "Gov/Community";
  status: "Completed" | "Current";
  impactMetric: string;
  description: string;
  technologies: string[];
  proofFileName?: string;
  isPublished?: boolean;
}

const DEFAULT_EXPERIENCE: CareerRecord[] = [
  {
    id: "1",
    role: "Software Development Intern",
    organization: "Diskominfo DIY",
    location: "Yogyakarta",
    period: "Aug 2024 – Nov 2024",
    type: "Internship",
    status: "Completed",
    impactMetric: "42% Query Latency Cut",
    description:
      "Architected and delivered upgrades to Government-scale microservices. Engineered schema migrations for legacy database models, successfully driving down indexed instrumentation and optimizing API query latency by 42% across core endpoints.",
    technologies: ["PostgreSQL", "Query Optimization", "API Gateways", "Linux / Systemd"],
    proofFileName: "Letter_Of_Completion.pdf",
    isPublished: true,
  },
  {
    id: "2",
    role: "Lead Web Development & Deployment",
    organization: "Desa Ambalkliwonan",
    location: "Central Java",
    period: "Jul 2023 – Sep 2023",
    type: "Gov/Community",
    status: "Completed",
    impactMetric: "100% Digital Administrative Transition",
    description:
      "Spearheaded comprehensive digital modernization program for municipal public records. Implemented automated data indexing, resident portals, and public information management systems.",
    technologies: ["Next.js", "MySQL", "Tailwind CSS", "Nginx", "Linux Ubuntu"],
    proofFileName: "SK_Pengembangan_Sistem.pdf",
    isPublished: true,
  },
  {
    id: "3",
    role: "Independent Systems Analyst & Backend Consultant",
    organization: "Freelance / Ad-Hoc",
    location: "Remote",
    period: "Contract / Ad-Hoc",
    type: "Contract",
    status: "Completed",
    impactMetric: "IEEE SRS Blueprints & Microservices",
    description:
      "Authored exhaustive Software Requirements Specifications (SRS) and Data/Sequence diagrams for commercial applications. Designed customized database schemas and built decoupled microservices foundations for growth-stage businesses.",
    technologies: ["SRS Blueprint", "Database Schemas", "UML Architecture"],
    proofFileName: "Client_Recommendation.pdf",
    isPublished: true,
  },
];

export function getExperience(): CareerRecord[] {
  return readJsonFile<CareerRecord[]>("experience.json", DEFAULT_EXPERIENCE);
}

export function saveExperience(records: CareerRecord[]): void {
  writeJsonFile("experience.json", records);
}

export function addExperience(record: Omit<CareerRecord, "id"> & { id?: string }): CareerRecord {
  const records = getExperience();
  const newRecord: CareerRecord = {
    ...record,
    id: record.id || Date.now().toString(),
    isPublished: record.isPublished !== undefined ? record.isPublished : true,
  };
  records.unshift(newRecord);
  saveExperience(records);
  return newRecord;
}

export function updateExperience(id: string, updates: Partial<CareerRecord>): CareerRecord | null {
  const records = getExperience();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...updates };
  saveExperience(records);
  return records[index];
}

export function deleteExperience(id: string): boolean {
  const records = getExperience();
  const filtered = records.filter((r) => r.id !== id);
  if (filtered.length === records.length) return false;
  saveExperience(filtered);
  return true;
}

// -------------------------------------------------------------
// 3. CERTIFICATIONS STORAGE
// -------------------------------------------------------------
export interface Credential {
  id: string;
  title: string;
  issuer: string;
  credentialId: string;
  issueDate: string;
  hash: string;
  fileName: string;
  fileSize: string;
  isHeroBadge: boolean;
  verifyUrl: string;
  fileUrl?: string;
  imageUrl?: string;
  gallery?: string[];
  description?: string;
}

const DEFAULT_CERTIFICATIONS: Credential[] = [
  {
    id: "1",
    title: "BNSP Junior Web Programming",
    issuer: "Badan Nasional Sertifikasi Profesi (BNSP)",
    credentialId: "BNSP-TI-2023-88943",
    issueDate: "Aug 2023 / Lifetime",
    hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    fileName: "BNSP_Cert_Zola_Official.pdf",
    fileSize: "2.4 MB",
    isHeroBadge: true,
    verifyUrl: "https://bnsp.go.id",
    description: "Assessed competencies in system programming, data validation compliance, software architecture, and modular routing.",
  },
  {
    id: "2",
    title: "Cloud Developer & Backend Master",
    issuer: "Dicoding Indonesia",
    credentialId: "DCD-BK-98314",
    issueDate: "Nov 2023 / Valid",
    hash: "sha256:7b902e482da7f81b31278149fbca087265a95260195e2634358601a424263092",
    fileName: "Dicoding_Backend_Specialization.pdf",
    fileSize: "4.1 MB",
    isHeroBadge: true,
    verifyUrl: "https://dicoding.com/certificates/DCD-BK-98314",
    description: "Comprehensive evaluation spanning asynchronous architecture, RESTful API design, multi-worker pipelines, and automated Linux deployment CI/CD.",
  },
  {
    id: "3",
    title: "Database Systems & Advanced SQL",
    issuer: "Enterprise Data Architecture",
    credentialId: "SQL-DBA-4410",
    issueDate: "Jan 2024 / Valid",
    hash: "sha256:4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123",
    fileName: "Advanced_SQL_Optimization_Cert.pdf",
    fileSize: "1.8 MB",
    isHeroBadge: true,
    verifyUrl: "https://example.com/verify/SQL-DBA-4410",
    description: "Specialized in indexing, normalization strategies to 3NF, ACID transaction guarantees, and complex query plan optimization.",
  },
];

export function getCertifications(): Credential[] {
  return readJsonFile<Credential[]>("certifications.json", DEFAULT_CERTIFICATIONS);
}

export function saveCertifications(certs: Credential[]): void {
  writeJsonFile("certifications.json", certs);
}

export function addCertification(cert: Omit<Credential, "id"> & { id?: string }): Credential {
  const certs = getCertifications();
  const newCert: Credential = {
    ...cert,
    id: cert.id || Date.now().toString(),
  };
  certs.unshift(newCert);
  saveCertifications(certs);
  return newCert;
}

export function updateCertification(id: string, updates: Partial<Credential>): Credential | null {
  const certs = getCertifications();
  const index = certs.findIndex((c) => c.id === id);
  if (index === -1) return null;
  certs[index] = { ...certs[index], ...updates };
  saveCertifications(certs);
  return certs[index];
}

export function deleteCertification(id: string): boolean {
  const certs = getCertifications();
  const filtered = certs.filter((c) => c.id !== id);
  if (filtered.length === certs.length) return false;
  saveCertifications(filtered);
  return true;
}

// -------------------------------------------------------------
// 4. SYSTEM SETTINGS STORAGE
// -------------------------------------------------------------
export interface SystemSettings {
  displayName: string;
  titleTag: string;
  siteTitle?: string;
  adminEmail: string;
  sessionTimeout: string;
  logClicks: boolean;
  deanonymizeGeo: boolean;
  retentionDays: string;
  poolLimit: number;
  maintenanceMode: boolean;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  displayName: "Zola Dimas Firmansyah",
  titleTag: "Information Systems & Junior Web Developer",
  siteTitle: "Information Systems & Junior Web Developer",
  adminEmail: "zoladimas32@gmail.com",
  sessionTimeout: "7 Days (Standard Persistence)",
  logClicks: true,
  deanonymizeGeo: true,
  retentionDays: "30 Days (Auto-pruning)",
  poolLimit: 20,
  maintenanceMode: false,
};

export function getSystemSettings(): SystemSettings {
  return readJsonFile<SystemSettings>("settings.json", DEFAULT_SETTINGS);
}

export function saveSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  const current = getSystemSettings();
  const titleTag = settings.titleTag || settings.siteTitle || current.titleTag;
  const siteTitle = settings.siteTitle || settings.titleTag || current.siteTitle || titleTag;

  const updated: SystemSettings = {
    ...current,
    ...settings,
    titleTag,
    siteTitle,
    updatedAt: new Date().toISOString(),
  };
  writeJsonFile("settings.json", updated);
  return updated;
}
