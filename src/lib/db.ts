import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Create a custom prisma client that maps camelCase names to snake_case models
export const prisma = new Proxy(basePrisma, {
  get(target, prop) {
    // Map camelCase model names (used by code) to snake_case models (actual Prisma client)
    const modelMappings: Record<string, any> = {
      siteSettings: (target as any).site_settings,
      page: (target as any).pages,
      headerConfig: (target as any).header_config,
      designSystem: (target as any).design_system,
      globalFunctions: (target as any).global_functions,
      homePageHero: (target as any).home_page_hero,
      cTA: (target as any).ctas,
      fAQ: (target as any).faqs,
      fAQCategory: (target as any).faq_categories,
      mediaLibrary: (target as any).media_library,
      contactField: (target as any).contact_fields,
      contactSection: (target as any).contact_sections,
      contactSubmission: (target as any).contact_submissions,
      formSubmission: (target as any).form_submissions,
      newsletterSubscriber: (target as any).newsletter_subscribers,
      serviceAccountCredentials: (target as any).service_account_credentials,
      sitemapSubmissionLog: (target as any).sitemap_submission_logs,
      menuItem: (target as any).menuItem,
      feature: (target as any).features,
      featureGroup: (target as any).feature_groups,
      basicFeature: (target as any).basic_features,
      form: (target as any).forms,
      adminUser: (target as any).admin_users,
      menu: (target as any).menu,
    };

    // If the property is a mapped model, return the mapped model
    if (modelMappings[prop as string]) {
      return modelMappings[prop as string];
    }

    // Otherwise, return the original property
    return (target as any)[prop];
  }
}) as any;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 