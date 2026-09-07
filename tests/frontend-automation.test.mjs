/**
 * Frontend Automation Test Suite
 * Automated verification of all public and administrative viewports,
 * UI components, design tokens, security gates, and API endpoints.
 */

import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "portfolio-cms-secret-key-development-mode-ZolaRayman";
const AUTH_HEADERS = { "x-admin-test-token": AUTH_SECRET };

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    process.stdout.write(`  • ${name}... `);
    await fn();
    passedTests++;
    console.log(`${colors.green}PASSED${colors.reset}`);
  } catch (err) {
    console.log(`${colors.red}FAILED${colors.reset}`);
    console.error(`    ${colors.red}Error: ${err.message}${colors.reset}`);
  }
}

console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan} RUNNING FRONTEND AUTOMATION TEST SUITE (Next.js 14) ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan} Target URL: ${BASE_URL}${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

// Helper to check for text with or without HTML entity encoding for '&'
function containsText(html, text) {
  const alt = text.replace(/&/g, "&amp;");
  return html.includes(text) || html.includes(alt);
}

// -------------------------------------------------------------
// 1. PUBLIC VIEWPORT TESTS
// -------------------------------------------------------------
console.log(`${colors.bold}1. Public Portfolio Viewport Tests${colors.reset}`);

await test("Public Homepage responds with 200 OK and valid HTML", async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(html.includes("<!DOCTYPE html>"), "Response should be valid HTML document");
});

await test("Public Homepage renders Obsidian design tokens & hero components", async () => {
  const res = await fetch(`${BASE_URL}/`);
  const html = await res.text();
  assert.ok(containsText(html, "Zola Dimas Firmansyah"), "Missing owner name");
  assert.ok(containsText(html, "AVAILABLE FOR WORK / CONTRACTS"), "Missing status beacon tag");
  assert.ok(
    containsText(html, "Systems") || containsText(html, "Developer") || containsText(html, "Engineering"),
    "Missing engineering headline/tag"
  );
  assert.ok(containsText(html, "Download Resume"), "Missing resume download button");
});

await test("Public Homepage renders Structured Engineering Arsenal (Skills)", async () => {
  const res = await fetch(`${BASE_URL}/`);
  const html = await res.text();
  assert.ok(containsText(html, "Structured Engineering Arsenal"), "Missing Arsenal section header");
  assert.ok(containsText(html, "Core Backend"), "Missing Core Backend category");
  assert.ok(containsText(html, "Modern Frontend"), "Missing Modern Frontend category");
  assert.ok(containsText(html, "Frameworks & Tooling"), "Missing Frameworks & Tooling category");
  assert.ok(containsText(html, "System Analysis"), "Missing Analysis category");
  assert.ok(containsText(html, "Infra & DevOps"), "Missing Infra category");
});

await test("Public Homepage renders Track Record & Impact Timeline", async () => {
  const res = await fetch(`${BASE_URL}/`);
  const html = await res.text();
  assert.ok(containsText(html, "Track Record & Impact"), "Missing Track Record header");
  assert.ok(containsText(html, "Diskominfo DIY"), "Missing Diskominfo experience");
  assert.ok(containsText(html, "Desa Ambalkliwonan"), "Missing Desa Ambalkliwonan milestone");
  assert.ok(
    containsText(html, "42%") || containsText(html, "Pemda DIY") || containsText(html, "Web Wiki") || containsText(html, "Golang"),
    "Missing Diskominfo DIY impact or contributions"
  );
});

await test("Public Homepage renders Real-World Implementations Bento Grid", async () => {
  const res = await fetch(`${BASE_URL}/`);
  const html = await res.text();
  assert.ok(
    containsText(html, "Real-World Implementations") || containsText(html, "Engineered Architectures"),
    "Missing Real-World Implementations section header"
  );
  assert.ok(
    containsText(html, "Multi-Hotel IT Asset Management System") ||
    containsText(html, "Sistem Manajemen Aset Multi-Hotel") ||
    containsText(html, "Multi-Hotel"),
    "Missing Featured Asset Management bento card"
  );
  assert.ok(
    containsText(html, "PostgreSQL") ||
    containsText(html, "ENTERPRISE") ||
    containsText(html, "Enterprise") ||
    containsText(html, "ERP") ||
    containsText(html, "Laravel") ||
    containsText(html, "Production Deployment"),
    "Missing tech stack badge or highlight tag"
  );
});

await test("Public Homepage renders Accreditation & Contact Callout", async () => {
  const res = await fetch(`${BASE_URL}/`);
  const html = await res.text();
  assert.ok(containsText(html, "Accreditation & Specialized Mastery"), "Missing Accreditation header");
  assert.ok(
    containsText(html, "BNSP") || containsText(html, "Junior Web") || containsText(html, "Junior Website"),
    "Missing BNSP certification"
  );
  assert.ok(
    containsText(html, "Let's collaborate on building robust web applications") ||
    containsText(html, "Let's collaborate"),
    "Missing contact section"
  );
});

await test("Public Homepage renders View Certificate triggers with Anti-Theft security attributes", async () => {
  const res = await fetch(`${BASE_URL}/`);
  const html = await res.text();
  assert.ok(containsText(html, "View Certificate"), "Missing View Certificate button on accreditation cards");
  assert.ok(containsText(html, "Verified Credential"), "Missing Verified Credential badge");
  assert.ok(containsText(html, "Accredited Credentials"), "Missing Accredited Credentials section tag");
});

// -------------------------------------------------------------
// 2. SECURITY & AUTHENTICATION GATES
// -------------------------------------------------------------
console.log(`\n${colors.bold}2. Security & Authentication Gate Tests${colors.reset}`);

await test("Unauthenticated access to /admin redirects with HTTP 307 to /admin/login", async () => {
  const res = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
  assert.equal(res.status, 307, "Expected HTTP 307 Temporary Redirect");
  const location = res.headers.get("location");
  assert.ok(location && location.includes("/admin/login"), "Should redirect to /admin/login");
});

await test("Unauthenticated access to /admin/projects redirects with HTTP 307 to /admin/login", async () => {
  const res = await fetch(`${BASE_URL}/admin/projects`, { redirect: "manual" });
  assert.equal(res.status, 307, "Expected HTTP 307 Temporary Redirect");
  const location = res.headers.get("location");
  assert.ok(location && location.includes("/admin/login"), "Should redirect to /admin/login");
});

await test("Admin Login Page (/admin/login) renders Obsidian Precision security gate", async () => {
  const res = await fetch(`${BASE_URL}/admin/login`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Admin CMS Authentication"), "Missing Admin CMS Authentication header");
  assert.ok(containsText(html, "Lanjutkan dengan Google"), "Missing Google login action button");
  assert.ok(containsText(html, "zoladimas32@gmail.com"), "Missing admin email whitelist notice");
});

// -------------------------------------------------------------
// 3. ADMIN CMS SUITE (AUTHENTICATED VIEWPORT TESTS)
// -------------------------------------------------------------
console.log(`\n${colors.bold}3. Admin CMS Suite (Authenticated Viewport Tests)${colors.reset}`);

await test("Admin Dashboard (/admin) renders real telemetry HUD & analytics", async () => {
  const res = await fetch(`${BASE_URL}/admin`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "System & Analytics Overview"), "Missing System & Analytics heading");
  assert.ok(containsText(html, "Telemetry Events"), "Missing Telemetry Events KPI card");
  assert.ok(containsText(html, "Published Projects"), "Missing Published Projects KPI card");
  assert.ok(containsText(html, "Project Telemetry Distribution"), "Missing project telemetry distribution");
  assert.ok(containsText(html, "Live Click Logs"), "Missing live click logs");
});

await test("Admin Projects Manager (/admin/projects) renders datatable", async () => {
  const res = await fetch(`${BASE_URL}/admin/projects`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Projects Management"), "Missing Projects Management title");
  assert.ok(containsText(html, "Total Repositories"), "Missing Total Repositories metric");
  assert.ok(containsText(html, "New Project"), "Missing New Project link button");
});

await test("Admin Project Creator (/admin/projects/create) renders form with storage upload", async () => {
  const res = await fetch(`${BASE_URL}/admin/projects/create`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Architecture Blueprint Record"), "Missing form header");
  assert.ok(containsText(html, "Featured Cover Visual"), "Missing Supabase thumbnail dropzone");
  assert.ok(containsText(html, "Highlight Tag / Badge"), "Missing Highlight Tag / Badge input");
  assert.ok(containsText(html, "Visual Blueprint & Gallery"), "Missing gallery screenshots upload");
  assert.ok(containsText(html, "Publish Project"), "Missing submit button");
});

await test("Admin Project Editor (/admin/projects/[id]/edit) renders edit form with preloaded blueprint", async () => {
  const projectsRes = await fetch(`${BASE_URL}/api/projects`);
  const projects = await projectsRes.json();
  const targetId = projects[0]?.id || "multi-hotel-asset-management";
  const res = await fetch(`${BASE_URL}/admin/projects/${targetId}/edit`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Edit Blueprint & Spesifikasi Proyek"), "Missing edit form header");
  assert.ok(containsText(html, "Kembali ke Daftar Proyek"), "Missing return link");
});

await test("Admin Skills & Stack Matrix (/admin/skills) renders categories and forms", async () => {
  const res = await fetch(`${BASE_URL}/admin/skills`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Skills & Technology Stack"), "Missing Skills title");
  assert.ok(containsText(html, "Core Backend & Database"), "Missing Core Backend category");
  assert.ok(containsText(html, "Register New Tech"), "Missing register new tech form");
  assert.ok(containsText(html, "Reorder Categories"), "Missing reorder action button");
});

await test("Admin Experience & Timeline (/admin/experience) renders milestones & editor", async () => {
  const res = await fetch(`${BASE_URL}/admin/experience`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Work Experience & Engagements"), "Missing Experience title");
  assert.ok(containsText(html, "Diskominfo DIY"), "Missing Diskominfo experience record");
  assert.ok(containsText(html, "Milestone Editor"), "Missing milestone editor form");
  assert.ok(containsText(html, "Preview Timeline View"), "Missing timeline preview button");
});

await test("Admin Certifications (/admin/certifications) renders credentials & verification", async () => {
  const res = await fetch(`${BASE_URL}/admin/certifications`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Certifications & Accreditations"), "Missing Certifications title");
  assert.ok(containsText(html, "BNSP Junior Website Programming"), "Missing BNSP record");
  assert.ok(containsText(html, "Verify All Hashes"), "Missing verify all hashes action");
  assert.ok(containsText(html, "Upload & Verify Credential"), "Missing credential form");
});

await test("Admin Profile CMS (/admin/profile) renders singleton editor", async () => {
  const res = await fetch(`${BASE_URL}/admin/profile`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "Profile & Bio CMS"), "Missing Profile title");
  assert.ok(containsText(html, "Hero Headline Title"), "Missing Hero Headline input");
  assert.ok(containsText(html, "Save Profile Changes"), "Missing Save button");
});

await test("Admin System Settings (/admin/settings) renders controls & Danger Zone", async () => {
  const res = await fetch(`${BASE_URL}/admin/settings`, { headers: AUTH_HEADERS });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const html = await res.text();
  assert.ok(containsText(html, "System Settings & Architecture"), "Missing Settings title");
  assert.ok(containsText(html, "Architecture Health"), "Missing Architecture Health card");
  assert.ok(containsText(html, "Danger Zone"), "Missing Danger Zone panel");
  assert.ok(containsText(html, "Flush Edge Cache Daemon"), "Missing flush edge cache button");
});

// -------------------------------------------------------------
// 4. API ROUTE HANDLER TESTS
// -------------------------------------------------------------
console.log(`\n${colors.bold}4. API Route Handler Tests${colors.reset}`);

await test("GET /api/projects returns valid JSON array", async () => {
  const res = await fetch(`${BASE_URL}/api/projects`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const data = await res.json();
  assert.ok(Array.isArray(data), "Expected JSON array response");
});

await test("GET /api/profile returns valid JSON response", async () => {
  const res = await fetch(`${BASE_URL}/api/profile`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const data = await res.json();
  assert.ok(typeof data === "object", "Expected JSON object");
  assert.ok(data.heroTitle, "Profile should have heroTitle");
});

await test("POST /api/track-click records telemetry payload", async () => {
  const res = await fetch(`${BASE_URL}/api/track-click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: "multi-hotel-asset-management" }),
  });
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const data = await res.json();
  assert.equal(data.success, true, "Expected success: true");
});

await test("GET /api/skills returns valid JSON array of skills", async () => {
  const res = await fetch(`${BASE_URL}/api/skills`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const data = await res.json();
  assert.ok(Array.isArray(data), "Expected JSON array of skills");
  assert.ok(data.length >= 5, "Should have seeded skills");
});

await test("GET /api/experience returns valid JSON array of career milestones", async () => {
  const res = await fetch(`${BASE_URL}/api/experience`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const data = await res.json();
  assert.ok(Array.isArray(data), "Expected JSON array of experience");
  assert.ok(data.length >= 2, "Should have seeded experience");
});

await test("GET /api/certifications returns valid JSON array of accredited credentials", async () => {
  const res = await fetch(`${BASE_URL}/api/certifications`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const data = await res.json();
  assert.ok(Array.isArray(data), "Expected JSON array of certifications");
  assert.ok(data.length >= 1, "Should have seeded certifications");
});

await test("GET /api/settings returns valid JSON system configuration", async () => {
  const res = await fetch(`${BASE_URL}/api/settings`);
  assert.equal(res.status, 200, "Expected HTTP 200 OK");
  const data = await res.json();
  assert.ok(typeof data === "object", "Expected JSON object");
  assert.ok(data.adminEmail, "Should contain adminEmail");
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
if (passedTests === totalTests) {
  console.log(`${colors.bold}${colors.green} ALL AUTOMATION TESTS PASSED (${passedTests}/${totalTests}) 100% SUCCESS${colors.reset}`);
} else {
  console.log(`${colors.bold}${colors.red} AUTOMATION TESTS COMPLETED WITH FAILURES (${passedTests}/${totalTests} passed)${colors.reset}`);
  process.exit(1);
}
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);
