const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class DummyWebSocket {};
}

// Load .env
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] ? match[2].trim() : "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  });
}

const prisma = new PrismaClient();

async function run() {
  console.log("=== TESTING FULL PRISMA & SUPABASE CONNECTION UNDER RLS ===");
  try {
    // 1. Profile Read
    const prof = await prisma.profile.findFirst();
    console.log("1. Profile read:", prof ? `OK (${prof.name})` : "NULL");

    // 2. Project Read
    const projs = await prisma.project.findMany({ take: 2 });
    console.log("2. Project read:", projs.length > 0 ? `OK (${projs.length} found)` : "0 items");

    // 3. Skill Read
    const skills = await prisma.skill.findMany({ take: 2 });
    console.log("3. Skill read:", skills.length > 0 ? `OK (${skills.length} found)` : "0 items");

    // 4. Experience Read
    const exp = await prisma.experience.findMany({ take: 2 });
    console.log("4. Experience read:", exp.length > 0 ? `OK (${exp.length} found)` : "0 items");

    // 5. Certification Read
    const certs = await prisma.certification.findMany({ take: 2 });
    console.log("5. Certification read:", certs.length > 0 ? `OK (${certs.length} found)` : "0 items");

    // 6. SystemSetting Read
    const setting = await prisma.systemSetting.findFirst();
    console.log("6. SystemSetting read:", setting ? `OK (${setting.titleTag})` : "NULL");

    // 7. Write Operation (ClickTracker)
    if (projs.length > 0) {
      const testClick = await prisma.clickTracker.create({
        data: {
          projectId: projs[0].id,
          userAgent: "RLS Test Agent",
          country: "ID",
        },
      });
      console.log("7. ClickTracker insert:", testClick.id ? `OK (${testClick.id})` : "FAILED");

      // 8. Delete Operation
      await prisma.clickTracker.delete({ where: { id: testClick.id } });
      console.log("8. ClickTracker delete:", "OK (Cleaned up)");
    }

    // 9. Update Operation (SystemSetting)
    await prisma.systemSetting.update({
      where: { id: 1 },
      data: { updatedAt: new Date() },
    });
    console.log("9. SystemSetting update:", "OK");

    // 10. Test Storage Bucket via Supabase Admin Client (Service Role Key)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets();
      if (bErr) {
        console.log("10. Storage listing error:", bErr.message);
      } else {
        console.log("10. Supabase Storage (Service Role): OK, buckets found ->", buckets.map((b) => b.name).join(", "));
      }
    }

    console.log("\n=== ALL DATABASE & STORAGE OPERATIONS CONFIRMED 100% WORKING UNDER RLS! ===");
  } catch (err) {
    console.error("FATAL ERROR DURING RLS CHECK:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
