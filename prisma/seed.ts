import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "crypto";

const prisma = new PrismaClient();

// Same hashing logic as src/lib/auth.ts
function hashPassword(password: string): string {
  const PBKDF2_ITERATIONS = 100000;
  const PBKDF2_KEYLEN = 64;
  const PBKDF2_DIGEST = "sha512";
  const salt = randomBytes(16);
  const derivedKey = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  return `${PBKDF2_ITERATIONS}:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const passwordHash = hashPassword(password);

  const user = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },  // Always update password hash to fix any old broken hashes
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