import { z } from 'zod';

// Common validations
export const IdSchema = z.number().int().positive();
export const SlugSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/, 'Invalid slug format');
export const UrlSchema = z.string().url('Invalid URL format');

// Site Settings Schema
export const SiteSettingsSchema = z.object({
  logoUrl: z.string().url().nullable(),
  faviconUrl: z.string().url().nullable(),
});

// Page Schema
export const CreatePageSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1, 'Title is required').max(200),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
  showInHeader: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
});

export const UpdatePageSchema = CreatePageSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// CTA Button Schema
export const CTAStyleEnum = z.enum(['primary', 'secondary', 'outline', 'ghost']);
export const CTATargetEnum = z.enum(['_self', '_blank']);

export const CreateCTASchema = z.object({
  text: z.string().min(1, 'Text is required').max(50),
  url: z.string().min(1, 'URL is required'),
  icon: z.string().max(50).optional(),
  style: CTAStyleEnum.default('primary'),
  target: CTATargetEnum.default('_self'),
  isActive: z.boolean().default(true),
});

export const UpdateCTASchema = CreateCTASchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Hero Section Schema
export const CreateHeroSectionSchema = z.object({
  pageId: IdSchema,
  heading: z.string().max(200).optional(),
  subheading: z.string().max(500).optional(),
  imageUrl: UrlSchema.optional(),
  visible: z.boolean().default(true),
});

export const UpdateHeroSectionSchema = CreateHeroSectionSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Feature Schema (for page-specific features)
export const FeatureCategoryEnum = z.enum(['integration', 'ai', 'automation', 'analytics', 'security', 'support']);

export const CreateFeatureSchema = z.object({
  pageId: IdSchema,
  iconUrl: UrlSchema.optional(),
  heading: z.string().min(1, 'Heading is required').max(200),
  subheading: z.string().max(500).optional(),
  position: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const UpdateFeatureSchema = CreateFeatureSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Trust Indicator Schema
export const TrustIndicatorSchema = z.object({
  iconName: z.string().min(1, 'Icon name is required').max(50),
  text: z.string().min(1, 'Text is required').max(100),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

// Global Feature Schema (for site-wide features)
export const CreateGlobalFeatureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  iconName: z.string().min(1, 'Icon name is required').max(50),
  category: FeatureCategoryEnum.default('integration'),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const UpdateGlobalFeatureSchema = CreateGlobalFeatureSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Feature Group Schema
export const CreateFeatureGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  heading: z.string().min(1, 'Heading is required').max(200),
  subheading: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const UpdateFeatureGroupSchema = CreateFeatureGroupSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Feature Group Item Schema
export const CreateFeatureGroupItemSchema = z.object({
  featureGroupId: IdSchema,
  featureId: IdSchema,
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const UpdateFeatureGroupItemSchema = CreateFeatureGroupItemSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Page Feature Group Schema
export const CreatePageFeatureGroupSchema = z.object({
  pageId: IdSchema,
  featureGroupId: IdSchema,
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const UpdatePageFeatureGroupSchema = CreatePageFeatureGroupSchema.extend({
  id: IdSchema,
}).partial().required({ id: true });

// Home Hero Schema  
export const HomeHeroSchema = z.object({
  heading: z.string().min(1, 'Heading is required').max(200),
  subheading: z.string().max(500),
  primaryCtaId: z.number().int().positive().nullable(),
  secondaryCtaId: z.number().int().positive().nullable(),
  isActive: z.boolean().default(true),
  trustIndicators: z.array(TrustIndicatorSchema).optional(),
});

export const UpdateHomeHeroSchema = HomeHeroSchema.partial();

// Header Config Schema
export const HeaderNavItemSchema = z.object({
  pageId: z.number().int().positive().nullable(),
  customText: z.string().max(100).nullable(),
  customUrl: z.string().max(500).nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const HeaderConfigSchema = z.object({
  isActive: z.boolean().default(true),
  navItems: z.array(HeaderNavItemSchema).optional(),
});

// Utility function to validate and transform request data
export function validateAndTransform<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  
  return result.data;
}

// API Response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};