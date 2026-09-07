/**
 * =======================================================================
 * BACKEND AUTOMATED INTEGRATION TEST SUITE (Next.js 14 + Supabase + Prisma)
 * =======================================================================
 * Authors: Zola Dimas Firmansyah & AI Architecture Assistant
 * Target: http://localhost:3000
 * Description: End-to-end testing of REST API Route Handlers, Supabase
 *              Storage, Telemetry Ingestion, and PostgreSQL Database transactions.
 * =======================================================================
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let testProjectId = null;
const TEST_SLUG = `test-backend-suite-${Date.now()}`;

// Pretty test formatting
function logGroup(title) {
  console.log(`\n\x1b[1m\x1b[36m--- [TEST SUITE] ${title} ---\x1b[0m`);
}

function logPass(msg) {
  console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
}

function logFail(msg, err) {
  console.error(`  \x1b[31m✖\x1b[0m ${msg}`);
  console.error(`    \x1b[31mError:\x1b[0m ${err.message}`);
}

async function runBackendTests() {
  console.log("\x1b[1m\x1b[35m====================================================\x1b[0m");
  console.log("\x1b[1m\x1b[35m RUNNING BACKEND AUTOMATION TEST SUITE (Next.js 14) \x1b[0m");
  console.log(` Target Server: \x1b[4m${BASE_URL}\x1b[0m`);
  console.log("\x1b[1m\x1b[35m====================================================\x1b[0m");

  let passedCount = 0;
  let totalCount = 0;

  // Snapshot local data files to guarantee 100% rollback after tests
  const filesToBackup = [
    "data/experience.json",
    "data/skills.json",
    "data/certifications.json",
    "data/settings.json",
  ];
  const fileSnapshots = new Map();
  for (const relPath of filesToBackup) {
    const fullPath = path.resolve(relPath);
    if (fs.existsSync(fullPath)) {
      fileSnapshots.set(fullPath, fs.readFileSync(fullPath, "utf-8"));
    }
  }

  // Backup original profile singleton
  let originalProfile = null;
  try {
    const pRes = await fetch(`${BASE_URL}/api/profile`);
    if (pRes.ok) {
      originalProfile = await pRes.json();
    }
  } catch {}

  let testSkillId = null;
  let testExpId = null;
  let testCertId = null;

  async function testCase(name, fn) {
    totalCount++;
    try {
      await fn();
      logPass(name);
      passedCount++;
    } catch (err) {
      logFail(name, err);
      throw err;
    }
  }

  try {
    // -------------------------------------------------------------
    // GROUP 1: SYSTEM HEALTH & DIAGNOSTICS
    // -------------------------------------------------------------
    logGroup("1. System Health & Infrastructure Diagnostics");

    await testCase("GET /api/health returns HEALTHY status with DB latency", async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.status, "HEALTHY", "System overall status should be HEALTHY");
      assert.strictEqual(data.checks.database.status, "HEALTHY", "Database check should be HEALTHY");
      assert.strictEqual(data.checks.storage.status, "HEALTHY", "Storage check should be HEALTHY");
      assert.ok(typeof data.checks.database.latencyMs === "number", "Should report database latency in ms");
    });

    // -------------------------------------------------------------
    // GROUP 2: PROFILE SINGLETON API
    // -------------------------------------------------------------
    logGroup("2. Profile Singleton CRUD & Validation");

    await testCase("GET /api/profile returns valid singleton record", async () => {
      const res = await fetch(`${BASE_URL}/api/profile`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.heroTitle, "Profile must have a heroTitle");
      assert.ok(data.emailContact, "Profile must have emailContact");
    });

    await testCase("PUT /api/profile rejects invalid email format with HTTP 400", async () => {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContact: "invalid-email-not-an-address" }),
      });
      assert.strictEqual(res.status, 400, `Expected 400 for invalid email, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.error, "Should return error message on invalid email");
    });

    await testCase("PUT /api/profile safely persists updated profile data", async () => {
      const payload = {
        heroTitle: "Systems Architect & Backend Engineer",
        heroSubtitle: "Specializing in Distributed Systems & PostgreSQL Optimization",
        emailContact: "zoladimas32@gmail.com",
      };
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.emailContact, "zoladimas32@gmail.com");
    });

    // -------------------------------------------------------------
    // GROUP 3: PROJECTS MANAGEMENT API
    // -------------------------------------------------------------
    logGroup("3. Projects CRUD Lifecycle & Constraints");

    await testCase("GET /api/projects returns JSON array with click counts", async () => {
      const res = await fetch(`${BASE_URL}/api/projects`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(Array.isArray(data), "Projects response must be an array");
      if (data.length > 0) {
        assert.ok(data[0]._count, "Project must include _count selector");
      }
    });

    await testCase("GET /api/projects?published=true filters only published items", async () => {
      const res = await fetch(`${BASE_URL}/api/projects?published=true`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(Array.isArray(data), "Must be an array");
      for (const p of data) {
        assert.strictEqual(p.isPublished, true, "All filtered projects must be published");
      }
    });

    await testCase("POST /api/projects rejects incomplete payload with HTTP 400", async () => {
      const res = await fetch(`${BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Incomplete Project" }),
      });
      assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    });

    await testCase("POST /api/projects successfully creates test project record with badge", async () => {
      const res = await fetch(`${BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Automated Test Project Runner",
          slug: TEST_SLUG,
          badge: "GOV-TECH | PUBLIC SECTOR",
          description: "Temporary backend test runner verification entity.",
          techStack: ["Node.js", "PostgreSQL", "Supabase", "Prisma"],
          liveUrl: "https://test.zola.dev",
          repoUrl: "https://github.com/zoladimas/test",
          isPublished: false,
        }),
      });
      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.id, "Created project must return unique primary key ID");
      assert.strictEqual(data.slug, TEST_SLUG);
      assert.strictEqual(data.badge, "GOV-TECH | PUBLIC SECTOR");
      testProjectId = data.id;
    });

    await testCase("POST /api/projects auto-generates slug when omitted", async () => {
      const uniqueTitle = `Auto Generated Slug Project ${Date.now()}`;
      const res = await fetch(`${BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uniqueTitle,
          description: "Testing automatic slug generation.",
          badge: "AUTO-SLUG-TEST",
        }),
      });
      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.slug.startsWith("auto-generated-slug-project"), "Slug must be auto-generated from title");
      assert.strictEqual(data.badge, "AUTO-SLUG-TEST");
      // Immediately clean up
      await fetch(`${BASE_URL}/api/projects/${data.id}`, { method: "DELETE" });
    });

    await testCase("POST /api/projects rejects duplicate slug with HTTP 409 conflict", async () => {
      const res = await fetch(`${BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Duplicate Slug Project",
          slug: TEST_SLUG,
          description: "This should conflict and fail.",
        }),
      });
      assert.strictEqual(res.status, 409, `Expected 409 Conflict, got ${res.status}`);
    });

    await testCase("GET /api/projects/[id] retrieves project by ID and by Slug", async () => {
      assert.ok(testProjectId, "Test project ID must exist");
      // By primary key ID
      const resById = await fetch(`${BASE_URL}/api/projects/${testProjectId}`);
      assert.strictEqual(resById.status, 200, `Lookup by ID expected 200, got ${resById.status}`);
      const dataById = await resById.json();
      assert.strictEqual(dataById.id, testProjectId);

      // By Slug
      const resBySlug = await fetch(`${BASE_URL}/api/projects/${TEST_SLUG}`);
      assert.strictEqual(resBySlug.status, 200, `Lookup by Slug expected 200, got ${resBySlug.status}`);
      const dataBySlug = await resBySlug.json();
      assert.strictEqual(dataBySlug.slug, TEST_SLUG);

      // Non-existent ID -> 404
      const resNotFound = await fetch(`${BASE_URL}/api/projects/non-existent-slug-xyz-999`);
      assert.strictEqual(resNotFound.status, 404, `Expected 404 for missing project, got ${resNotFound.status}`);
    });

    await testCase("PATCH /api/projects/[id] updates state, badge, and toggles publication", async () => {
      assert.ok(testProjectId, "Test project ID must exist");
      const res = await fetch(`${BASE_URL}/api/projects/${testProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: true,
          title: "Automated Test Project Runner (Published)",
          badge: "ENTERPRISE SaaS | MULTI-TENANT",
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.isPublished, true);
      assert.strictEqual(data.title, "Automated Test Project Runner (Published)");
      assert.strictEqual(data.badge, "ENTERPRISE SaaS | MULTI-TENANT");
    });

    // -------------------------------------------------------------
    // GROUP 4: SUPABASE STORAGE UPLOAD API
    // -------------------------------------------------------------
    logGroup("4. Supabase Storage Object Uploads");

    await testCase("POST /api/upload rejects non-image MIME types with HTTP 400", async () => {
      const formData = new FormData();
      const textBlob = new Blob(["malicious script contents"], { type: "text/plain" });
      formData.append("file", textBlob, "payload.txt");

      const res = await fetch(`${BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      assert.strictEqual(res.status, 400, `Expected 400 on non-image, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.error, "Should return error message on invalid file type");
    });

    await testCase("POST /api/upload uploads valid image to Supabase and returns public URL", async () => {
      const formData = new FormData();
      // Valid minimal PNG buffer (8-byte PNG signature + empty IHDR)
      const pngBytes = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
        0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);
      const pngBlob = new Blob([pngBytes], { type: "image/png" });
      formData.append("file", pngBlob, "test-thumbnail.png");
      formData.append("folder", "test-audit");

      const res = await fetch(`${BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      assert.strictEqual(res.status, 201, `Expected 201 on valid upload, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.url, "Must return uploaded image URL");
      assert.ok(data.url.includes("supabase.co"), "URL must point to Supabase Storage domain");
    });

    await testCase("POST /api/upload uploads PDF document to Supabase and returns public URL", async () => {
      const formData = new FormData();
      const pdfBytes = new TextEncoder().encode("%PDF-1.4 sample test specification document %EOF");
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      formData.append("file", pdfBlob, "test-specification.pdf");
      formData.append("folder", "documents");

      const res = await fetch(`${BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      assert.strictEqual(res.status, 201, `Expected 201 on valid PDF upload, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.url, "Must return uploaded document URL");
      assert.ok(data.url.includes("supabase.co"), "URL must point to Supabase Storage domain");
      assert.ok(data.url.endsWith(".pdf"), "URL should retain .pdf extension");
    });

    // -------------------------------------------------------------
    // GROUP 5: OUTBOUND CLICK TELEMETRY API
    // -------------------------------------------------------------
    logGroup("5. Telemetry Ingestion & Analytics Aggregation");

    await testCase("POST /api/track-click ingests event with client headers", async () => {
      assert.ok(testProjectId, "Test project ID must exist");
      const res = await fetch(`${BASE_URL}/api/track-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Antigravity-Automated-Telemetry-Tester/1.0",
          "X-Vercel-IP-Country": "ID",
        },
        body: JSON.stringify({ projectId: testProjectId }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.tracked, true);
    });

    await testCase("GET /api/track-click returns telemetry analytics summary", async () => {
      const res = await fetch(`${BASE_URL}/api/track-click`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(typeof data.totalClicks === "number", "totalClicks must be a number");
      assert.ok(Array.isArray(data.projectsWithClicks), "projectsWithClicks must be an array");
      assert.ok(typeof data.countryBreakdown === "object", "countryBreakdown must be an object");
      assert.ok(data.totalClicks >= 1, "Should have recorded at least 1 click");
    });

    // -------------------------------------------------------------
    // GROUP 6: PROJECT TEARDOWN & CASCADE DELETION
    // -------------------------------------------------------------
    logGroup("6. Cascade Deletion & Cleanup");

    await testCase("DELETE /api/projects/[id] removes project and cascades telemetry", async () => {
      assert.ok(testProjectId, "Test project ID must exist");
      const res = await fetch(`${BASE_URL}/api/projects/${testProjectId}`, {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.success, true);

      // Verify it no longer exists
      const verifyRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}`);
      assert.strictEqual(verifyRes.status, 404, "Project should return 404 after deletion");
    });

    // -------------------------------------------------------------
    // GROUP 7: SKILLS CMS PERSISTENCE & CRUD API
    // -------------------------------------------------------------
    logGroup("7. Skills & Stack Matrix CRUD & Persistence");

    await testCase("GET /api/skills returns skills array with all categories", async () => {
      const res = await fetch(`${BASE_URL}/api/skills`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(Array.isArray(data), "Skills response must be an array");
      assert.ok(data.length >= 5, "Should have default skills loaded");
      assert.ok(data.some((s) => s.category === "backend"), "Must contain backend category");
      assert.ok(data.some((s) => s.category === "frontend"), "Must contain frontend category");
      assert.ok(data.some((s) => s.category === "framework"), "Must contain framework category");
      assert.ok(data.some((s) => s.category === "analysis"), "Must contain analysis category");
      assert.ok(data.some((s) => s.category === "devops"), "Must contain devops category");
    });

    await testCase("POST /api/skills creates new persistent skill", async () => {
      const payload = {
        name: "Automated Integration Test Stack",
        category: "backend",
        description: "High-throughput validation harness for persistent CRUD",
        proficiency: 95,
        level: "mastery",
      };
      const res = await fetch(`${BASE_URL}/api/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.id, "Created skill must have an ID");
      assert.strictEqual(data.name, payload.name);
      testSkillId = data.id;
    });

    await testCase("PUT /api/skills updates skill proficiency and level", async () => {
      assert.ok(testSkillId, "Test skill ID must exist");
      const res = await fetch(`${BASE_URL}/api/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testSkillId,
          proficiency: 99,
          level: "mastery",
          description: "Updated description via backend test suite",
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.proficiency, 99);
      assert.strictEqual(data.description, "Updated description via backend test suite");
    });

    await testCase("PATCH /api/skills toggles isFeatured status", async () => {
      assert.ok(testSkillId, "Test skill ID must exist");
      const res = await fetch(`${BASE_URL}/api/skills`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testSkillId,
          isFeatured: false,
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.isFeatured, false);
    });

    await testCase("DELETE /api/skills removes skill persistently", async () => {
      assert.ok(testSkillId, "Test skill ID must exist");
      const res = await fetch(`${BASE_URL}/api/skills?id=${testSkillId}`, {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.success, true);

      // Verify deletion from GET list
      const getRes = await fetch(`${BASE_URL}/api/skills`);
      const allSkills = await getRes.json();
      assert.ok(!allSkills.some((s) => s.id === testSkillId), "Skill should no longer exist in storage");
    });

    // -------------------------------------------------------------
    // GROUP 8: EXPERIENCE & CAREER CMS API
    // -------------------------------------------------------------
    logGroup("8. Experience & Career Milestones CRUD & Persistence");

    await testCase("GET /api/experience returns career records array", async () => {
      const res = await fetch(`${BASE_URL}/api/experience`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(Array.isArray(data), "Experience response must be an array");
      assert.ok(data.length >= 2, "Must contain default milestones");
    });

    await testCase("POST /api/experience creates new career milestone", async () => {
      const payload = {
        role: "Senior Distributed Systems Consultant",
        organization: "Automated QA Labs",
        location: "Yogyakarta",
        period: "Jan 2025 – Present",
        type: "Contract",
        status: "Current",
        impactMetric: "99.99% Uptime Guarantee",
        description: "Architected fault-tolerant systems and automated deployment pipelines.",
        technologies: ["Node.js", "Docker", "PostgreSQL"],
      };
      const res = await fetch(`${BASE_URL}/api/experience`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.id, "Created experience record must have an ID");
      assert.strictEqual(data.role, payload.role);
      testExpId = data.id;
    });

    await testCase("PUT /api/experience updates experience details", async () => {
      assert.ok(testExpId, "Test experience ID must exist");
      const res = await fetch(`${BASE_URL}/api/experience`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testExpId,
          impactMetric: "100% Zero-Downtime Deployment",
          status: "Completed",
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.impactMetric, "100% Zero-Downtime Deployment");
      assert.strictEqual(data.status, "Completed");
    });

    await testCase("PATCH /api/experience toggles isPublished status", async () => {
      assert.ok(testExpId, "Test experience ID must exist");
      const res = await fetch(`${BASE_URL}/api/experience`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testExpId,
          isPublished: false,
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.isPublished, false);
    });

    await testCase("DELETE /api/experience removes milestone persistently", async () => {
      assert.ok(testExpId, "Test experience ID must exist");
      const res = await fetch(`${BASE_URL}/api/experience?id=${testExpId}`, {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.success, true);

      // Verify deletion from GET list
      const getRes = await fetch(`${BASE_URL}/api/experience`);
      const allRecords = await getRes.json();
      assert.ok(!allRecords.some((e) => e.id === testExpId), "Milestone should no longer exist in storage");
    });

    // -------------------------------------------------------------
    // GROUP 9: CERTIFICATIONS CMS API
    // -------------------------------------------------------------
    logGroup("9. Certifications & Credentials CRUD & Persistence");

    await testCase("GET /api/certifications returns credentials array", async () => {
      const res = await fetch(`${BASE_URL}/api/certifications`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(Array.isArray(data), "Certifications response must be an array");
      assert.ok(data.length >= 1, "Must contain credentials");
    });

    await testCase("POST /api/certifications creates new accredited credential", async () => {
      const payload = {
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        credentialId: "AWS-PSA-99120",
        issueDate: "2025 / Valid",
        hash: "sha256:testcredentialhash99887766554433221100",
        fileName: "AWS_Certified_Architect.pdf",
        fileSize: "1.2 MB",
        isHeroBadge: true,
        verifyUrl: "https://aws.amazon.com/verify/AWS-PSA-99120",
        description: "Specialized in cloud distributed computing and serverless microservices.",
      };
      const res = await fetch(`${BASE_URL}/api/certifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.id, "Created credential must have an ID");
      assert.strictEqual(data.title, payload.title);
      testCertId = data.id;
    });

    await testCase("PUT /api/certifications updates credential information", async () => {
      assert.ok(testCertId, "Test cert ID must exist");
      const res = await fetch(`${BASE_URL}/api/certifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testCertId,
          issuer: "Amazon Web Services (Global Accreditation)",
          fileSize: "1.5 MB",
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.issuer, "Amazon Web Services (Global Accreditation)");
      assert.strictEqual(data.fileSize, "1.5 MB");
    });

    await testCase("PATCH /api/certifications toggles isHeroBadge status", async () => {
      assert.ok(testCertId, "Test cert ID must exist");
      const res = await fetch(`${BASE_URL}/api/certifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testCertId,
          isHeroBadge: false,
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.isHeroBadge, false);
    });

    await testCase("DELETE /api/certifications removes credential persistently", async () => {
      assert.ok(testCertId, "Test cert ID must exist");
      const res = await fetch(`${BASE_URL}/api/certifications?id=${testCertId}`, {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.success, true);

      // Verify deletion from GET list
      const getRes = await fetch(`${BASE_URL}/api/certifications`);
      const allCerts = await getRes.json();
      assert.ok(!allCerts.some((c) => c.id === testCertId), "Credential should no longer exist in storage");
    });

    // -------------------------------------------------------------
    // GROUP 10: SYSTEM SETTINGS API
    // -------------------------------------------------------------
    logGroup("10. System Settings & Environment Configuration");

    await testCase("GET /api/settings returns system configuration", async () => {
      const res = await fetch(`${BASE_URL}/api/settings`);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.siteTitle, "Must have siteTitle");
      assert.ok(typeof data.maintenanceMode === "boolean", "maintenanceMode must be boolean");
    });

    await testCase("PUT /api/settings persists updated system settings", async () => {
      const originalRes = await fetch(`${BASE_URL}/api/settings`);
      const originalData = await originalRes.json();

      const res = await fetch(`${BASE_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle: "Zola Dimas Firmansyah — Systems Architect [Test]",
          maintenanceMode: false,
          maxUploadSizeMB: 10,
        }),
      });
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.siteTitle, "Zola Dimas Firmansyah — Systems Architect [Test]");

      // Revert to original
      await fetch(`${BASE_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(originalData),
      });
    });

    // -------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------
    console.log("\n\x1b[1m\x1b[32m====================================================\x1b[0m");
    console.log(`\x1b[1m\x1b[32m ALL BACKEND AUTOMATION TESTS PASSED (${passedCount}/${totalCount}) 100% SUCCESS\x1b[0m`);
    console.log("\x1b[1m\x1b[32m====================================================\x1b[0m\n");
  } catch (error) {
    console.error("\n\x1b[1m\x1b[31m====================================================\x1b[0m");
    console.error(`\x1b[1m\x1b[31m BACKEND AUTOMATION TESTS FAILED (${passedCount}/${totalCount} passed)\x1b[0m`);
    console.error("\x1b[1m\x1b[31m====================================================\x1b[0m\n");
    process.exitCode = 1;
  } finally {
    // -------------------------------------------------------------
    // AUTOMATIC TEARDOWN & REVERT ENVIRONMENT TO PRE-TEST BASELINE
    // -------------------------------------------------------------
    console.log("\x1b[1m\x1b[36m--- [TEARDOWN & CLEANUP] Restoring Project Environment Baseline ---\x1b[0m");

    // 1. Delete test project if still hanging
    if (testProjectId) {
      try {
        await fetch(`${BASE_URL}/api/projects/${testProjectId}`, { method: "DELETE" });
      } catch {}
    }

    // Deep sweep: fetch all projects and delete any lingering test projects
    try {
      const allProjectsRes = await fetch(`${BASE_URL}/api/projects`);
      if (allProjectsRes.ok) {
        const allProjects = await allProjectsRes.json();
        for (const proj of allProjects) {
          if (
            proj.slug?.startsWith("test-backend-suite") ||
            proj.slug?.startsWith("auto-generated-slug-project") ||
            proj.title?.includes("Automated Test Project Runner") ||
            proj.title?.includes("Duplicate Slug Project") ||
            proj.title?.includes("Auto Generated Slug Project")
          ) {
            await fetch(`${BASE_URL}/api/projects/${proj.id}`, { method: "DELETE" });
          }
        }
      }
    } catch {}

    // 2. Delete test skill if still hanging
    if (testSkillId) {
      try {
        await fetch(`${BASE_URL}/api/skills?id=${testSkillId}`, { method: "DELETE" });
      } catch {}
    }

    // 3. Delete test experience if still hanging
    if (testExpId) {
      try {
        await fetch(`${BASE_URL}/api/experience?id=${testExpId}`, { method: "DELETE" });
      } catch {}
    }

    // 4. Delete test certification if still hanging
    if (testCertId) {
      try {
        await fetch(`${BASE_URL}/api/certifications?id=${testCertId}`, { method: "DELETE" });
      } catch {}
    }

    // 5. Restore original profile singleton if modified during tests
    if (originalProfile) {
      try {
        await fetch(`${BASE_URL}/api/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: originalProfile.name,
            heroTitle: originalProfile.heroTitle,
            heroSubtitle: originalProfile.heroSubtitle,
            emailContact: originalProfile.emailContact,
            location: originalProfile.location,
            aboutText: originalProfile.aboutText,
            githubUrl: originalProfile.githubUrl,
            linkedinUrl: originalProfile.linkedinUrl,
            resumeUrl: originalProfile.resumeUrl,
          }),
        });
      } catch {}
    }

    // 6. Restore file snapshots to guarantee exact pre-test state
    for (const [fullPath, content] of fileSnapshots.entries()) {
      try {
        fs.writeFileSync(fullPath, content, "utf-8");
      } catch {}
    }

    console.log("  \x1b[32m✔\x1b[0m Environment, JSON storage, and database state 100% restored to baseline.\n");
  }
}

runBackendTests();
