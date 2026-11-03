import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return null;
  }
}

async function migrate() {
  console.log("=== Starting Data Migration: JSON -> PostgreSQL (Supabase) ===");

  // 1. Migrate Certifications
  const certs = readJson<any[]>("certifications.json") || [];
  console.log(`Found ${certs.length} certifications in JSON.`);
  for (let i = 0; i < certs.length; i++) {
    const c = certs[i];
    await prisma.certification.upsert({
      where: { id: String(c.id) },
      update: {
        title: c.title,
        issuer: c.issuer,
        credentialId: c.credentialId || `CRED-${Date.now()}`,
        issueDate: c.issueDate || "2024 / Valid",
        hash: c.hash || null,
        fileName: c.fileName || null,
        fileSize: c.fileSize || null,
        isHeroBadge: Boolean(c.isHeroBadge),
        verifyUrl: c.verifyUrl || null,
        fileUrl: c.fileUrl || null,
        imageUrl: c.imageUrl || null,
        gallery: Array.isArray(c.gallery) ? c.gallery : [],
        description: c.description || null,
        order: i,
      },
      create: {
        id: String(c.id),
        title: c.title,
        issuer: c.issuer,
        credentialId: c.credentialId || `CRED-${Date.now()}`,
        issueDate: c.issueDate || "2024 / Valid",
        hash: c.hash || null,
        fileName: c.fileName || null,
        fileSize: c.fileSize || null,
        isHeroBadge: Boolean(c.isHeroBadge),
        verifyUrl: c.verifyUrl || null,
        fileUrl: c.fileUrl || null,
        imageUrl: c.imageUrl || null,
        gallery: Array.isArray(c.gallery) ? c.gallery : [],
        description: c.description || null,
        order: i,
      },
    });
  }
  console.log(`✓ Certifications successfully migrated.`);

  // 2. Migrate Skills
  const skills = readJson<any[]>("skills.json") || [];
  console.log(`Found ${skills.length} skills in JSON.`);
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    await prisma.skill.upsert({
      where: { id: String(s.id) },
      update: {
        name: s.name,
        category: s.category || "backend",
        description: s.description || null,
        proficiency: Number(s.proficiency) || 85,
        level: s.level || "mastery",
        isFeatured: s.isFeatured !== undefined ? Boolean(s.isFeatured) : true,
        order: i,
      },
      create: {
        id: String(s.id),
        name: s.name,
        category: s.category || "backend",
        description: s.description || null,
        proficiency: Number(s.proficiency) || 85,
        level: s.level || "mastery",
        isFeatured: s.isFeatured !== undefined ? Boolean(s.isFeatured) : true,
        order: i,
      },
    });
  }
  console.log(`✓ Skills successfully migrated.`);

  // 3. Migrate Experience
  const experiences = readJson<any[]>("experience.json") || [];
  console.log(`Found ${experiences.length} experience records in JSON.`);
  for (let i = 0; i < experiences.length; i++) {
    const e = experiences[i];
    await prisma.experience.upsert({
      where: { id: String(e.id) },
      update: {
        role: e.role,
        organization: e.organization,
        location: e.location || "Indonesia",
        period: e.period || "2024",
        type: e.type || "Internship",
        status: e.status || "Completed",
        impactMetric: e.impactMetric || null,
        description: e.description || "",
        technologies: Array.isArray(e.technologies) ? e.technologies : [],
        proofFileName: e.proofFileName || null,
        isPublished: e.isPublished !== undefined ? Boolean(e.isPublished) : true,
        order: i,
      },
      create: {
        id: String(e.id),
        role: e.role,
        organization: e.organization,
        location: e.location || "Indonesia",
        period: e.period || "2024",
        type: e.type || "Internship",
        status: e.status || "Completed",
        impactMetric: e.impactMetric || null,
        description: e.description || "",
        technologies: Array.isArray(e.technologies) ? e.technologies : [],
        proofFileName: e.proofFileName || null,
        isPublished: e.isPublished !== undefined ? Boolean(e.isPublished) : true,
        order: i,
      },
    });
  }
  console.log(`✓ Experience successfully migrated.`);

  // 4. Migrate System Settings
  const settings = readJson<any>("settings.json");
  if (settings) {
    console.log(`Found settings in JSON.`);
    await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: {
        displayName: settings.displayName || "Zola Dimas Firmansyah",
        titleTag: settings.titleTag || "Information Systems & Junior Web Developer",
        siteTitle: settings.siteTitle || settings.titleTag || null,
        adminEmail: settings.adminEmail || "zoladimas32@gmail.com",
        sessionTimeout: settings.sessionTimeout || "7 Days (Standard Persistence)",
        logClicks: settings.logClicks !== undefined ? Boolean(settings.logClicks) : true,
        deanonymizeGeo: settings.deanonymizeGeo !== undefined ? Boolean(settings.deanonymizeGeo) : true,
        retentionDays: settings.retentionDays || "30 Days (Auto-pruning)",
        poolLimit: Number(settings.poolLimit) || 20,
        maintenanceMode: Boolean(settings.maintenanceMode),
        maxUploadSizeMB: Number(settings.maxUploadSizeMB) || 10,
      },
      create: {
        id: 1,
        displayName: settings.displayName || "Zola Dimas Firmansyah",
        titleTag: settings.titleTag || "Information Systems & Junior Web Developer",
        siteTitle: settings.siteTitle || settings.titleTag || null,
        adminEmail: settings.adminEmail || "zoladimas32@gmail.com",
        sessionTimeout: settings.sessionTimeout || "7 Days (Standard Persistence)",
        logClicks: settings.logClicks !== undefined ? Boolean(settings.logClicks) : true,
        deanonymizeGeo: settings.deanonymizeGeo !== undefined ? Boolean(settings.deanonymizeGeo) : true,
        retentionDays: settings.retentionDays || "30 Days (Auto-pruning)",
        poolLimit: Number(settings.poolLimit) || 20,
        maintenanceMode: Boolean(settings.maintenanceMode),
        maxUploadSizeMB: Number(settings.maxUploadSizeMB) || 10,
      },
    });
    console.log(`✓ Settings successfully migrated.`);
  }

  console.log("=== All data successfully migrated to Supabase PostgreSQL! ===");
}

migrate()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

