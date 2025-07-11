const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding pricing system...");
  
  await prisma.billingCycle.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, label: "Monthly", multiplier: 1, isDefault: true }
  });
  
  await prisma.billingCycle.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, label: "Yearly", multiplier: 12, isDefault: false }
  });
  
  await prisma.pricingFeature.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Connect to WhatsApp", category: "Integrations", position: 1, isActive: true }
  });
  
  await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Starter", description: "Perfect for small businesses", position: 1, isActive: true }
  });
  
  await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "Professional", description: "Best for growing businesses", position: 2, isActive: true, isPopular: true }
  });
  
  console.log("Pricing system seeded successfully!");
  await prisma.$disconnect();
}

main().catch(console.error);
