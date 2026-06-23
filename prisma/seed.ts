import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const passwordHash = pbkdf2Sync(password, "greenhaven-salt", 100000, 64, "sha512").toString("hex");

  const user = await prisma.adminUser.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Admin user "${user.username}" ready`);

  // Seed default site settings
  const defaults = [
    { key: "siteName", value: "GreenHaven Nursery" },
    { key: "heroBadge", value: "🌿 Nepal's Premier Online Nursery" },
    { key: "heroTitle", value: "Bring Nature\\nInto Your Home" },
    { key: "heroSubtitle", value: "Discover our handpicked collection of premium plants, expertly grown and delivered fresh to your doorstep across Nepal." },
    { key: "footerDescription", value: "GreenHaven Nursery — your trusted partner for premium plants and garden essentials in Nepal since 2020." },
    { key: "footerAddress", value: "Thamel, Kathmandu, Nepal" },
    { key: "footerPhone", value: "+977-9800000000" },
    { key: "footerEmail", value: "hello@greenhaven.com.np" },
    { key: "freeDeliveryThreshold", value: "2500" },
    { key: "deliveryFee", value: "150" },
    { key: "primaryColor", value: "oklch(0.32 0.12 155)" },
    { key: "goldColor", value: "oklch(0.72 0.13 80)" },
  ];

  for (const s of defaults) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log(`Site settings seeded (${defaults.length} settings)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());