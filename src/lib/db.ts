import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Create a custom prisma client that maps snake_case names to camelCase models
export const prisma = new Proxy(basePrisma, {
  get(target, prop) {
    // Map snake_case model names to camelCase models
    const modelMappings: Record<string, any> = {
      site_settings: target.siteSettings,
      pages: target.page,
      header_config: target.headerConfig,
      design_system: target.designSystem,
      global_functions: target.globalFunctions,
      home_page_hero: target.homePageHero,
    };

    // If the property is a snake_case model name, return the mapped camelCase model
    if (typeof prop === 'string' && modelMappings[prop]) {
      return modelMappings[prop];
    }

    // Otherwise, return the original property
    return target[prop as keyof PrismaClient];
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma; 