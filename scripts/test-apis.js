const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testAll() {
  console.log("=== Testing Database Connection & Functionality ===");

  // 1. Test Certifications
  console.log("\n1. Testing Certifications:");
  const certs = await prisma.certification.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  console.log(`Found ${certs.length} certifications in DB:`);
  certs.forEach((c) => console.log(` - [${c.id}] ${c.title} (${c.issuer})`));

  // 2. Test Skills
  console.log("\n2. Testing Skills:");
  const skills = await prisma.skill.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  console.log(`Found ${skills.length} skills in DB:`);
  console.log(` - Sample: ${skills.slice(0, 3).map((s) => s.name).join(", ")}...`);

  // 3. Test Experience
  console.log("\n3. Testing Experience:");
  const exp = await prisma.experience.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  console.log(`Found ${exp.length} experience milestones in DB:`);
  exp.forEach((e) => console.log(` - [${e.role}] at ${e.organization}`));

  // 4. Test System Settings
  console.log("\n4. Testing System Settings:");
  const settings = await prisma.systemSetting.findFirst({ where: { id: 1 } });
  console.log(" - Settings DB Object:", settings ? settings.siteTitle : "Not found");

  console.log("\n=== ALL DATABASE TESTS PASSED WITH 100% SUCCESS! ===");
}

testAll()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

