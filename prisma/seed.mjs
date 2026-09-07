import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Supabase PostgreSQL database...");

  // 1. Seed Profile Singleton
  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: "Systems Architect & Backend Engineer",
      heroSubtitle: "Specializing in Distributed Systems, UML Modeling, and PostgreSQL Optimization",
      aboutText: "Information Systems specialist with deep focus on enterprise backend architectures, PostgreSQL query optimization (42% latency reduction during Diskominfo DIY tenure), UML system analysis, and reliable REST/gRPC API gateways.",
      emailContact: "zoladimas32@gmail.com",
      githubUrl: "https://github.com/zoladimas",
      linkedinUrl: "https://linkedin.com/in/zoladimas",
      resumeUrl: "/cv-zola-dimas.pdf",
    },
  });
  console.log("Profile Singleton seeded:", profile.id);

  // 2. Seed Projects
  const project1 = await prisma.project.upsert({
    where: { slug: "multi-hotel-asset-management" },
    update: {},
    create: {
      title: "Sistem Manajemen Aset Multi-Hotel",
      slug: "multi-hotel-asset-management",
      description: "Enterprise asset management platform designed for multi-tenant hotel chains. Features distributed PostgreSQL schemas with row-level tenant isolation, automated maintenance lifecycle tracking, and fast query execution (<4.2ms avg).",
      thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
      techStack: ["PostgreSQL", "Next.js", "Prisma", "TypeScript", "Tailwind CSS", "Docker"],
      liveUrl: "https://hotel-asset-demo.zola.dev",
      repoUrl: "https://github.com/zoladimas/hotel-asset-manager",
      isPublished: true,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: "telemetry-event-daemon" },
    update: {},
    create: {
      title: "Outbound Click Telemetry & Event Daemon",
      slug: "telemetry-event-daemon",
      description: "High-throughput asynchronous telemetry logging service utilizing navigator.sendBeacon, client edge headers for geolocation, and batch database ingestion.",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
      techStack: ["Node.js", "PostgreSQL", "Prisma", "Vercel Edge", "TypeScript"],
      liveUrl: "https://telemetry-demo.zola.dev",
      repoUrl: "https://github.com/zoladimas/click-telemetry",
      isPublished: true,
    },
  });

  console.log("Projects seeded:", [project1.slug, project2.slug]);
  console.log("Database successfully populated!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
