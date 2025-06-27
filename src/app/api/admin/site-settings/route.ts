import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const SiteSettingsSchema = z.object({
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  
  // Email Configuration
  smtpEnabled: z.boolean().optional(),
  smtpHost: z.string().optional().nullable(),
  smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
  smtpSecure: z.boolean().optional(),
  smtpUsername: z.string().optional().nullable(),
  smtpPassword: z.string().optional().nullable(),
  smtpFromEmail: z.string().email().optional().nullable(),
  smtpFromName: z.string().optional().nullable(),
  smtpReplyTo: z.string().email().optional().nullable(),
  
  // Email Templates Configuration
  emailSignature: z.string().optional().nullable(),
  emailFooterText: z.string().optional().nullable(),
  emailBrandingEnabled: z.boolean().optional(),
  
  // Email Notification Settings
  adminNotificationEmail: z.string().email().optional().nullable(),
  emailLoggingEnabled: z.boolean().optional(),
  emailRateLimitPerHour: z.number().int().min(1).max(1000).optional().nullable(),
  
  // Company Contact Information
  companyPhone: z.string().optional().nullable(),
  companyEmail: z.string().email().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  
  // Social Media Links
  socialFacebook: z.string().url().optional().nullable(),
  socialTwitter: z.string().url().optional().nullable(),
  socialLinkedin: z.string().url().optional().nullable(),
  socialInstagram: z.string().url().optional().nullable(),
  socialYoutube: z.string().url().optional().nullable(),
});

// GET - Retrieve current site settings
export async function GET() {
  try {
    let siteSettings = await prisma.siteSettings.findFirst();
    
    // Create default settings if none exist
    if (!siteSettings) {
      siteSettings = await prisma.siteSettings.create({
        data: {
          smtpEnabled: false,
          smtpPort: 587,
          smtpSecure: true,
          emailBrandingEnabled: true,
          emailLoggingEnabled: true,
          emailRateLimitPerHour: 100,
        },
      });
    }

    // Remove sensitive data before sending to client
    const { smtpPassword, ...safeSiteSettings } = siteSettings;

    return NextResponse.json(safeSiteSettings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update site settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logoUrl, faviconUrl } = body;

    // Check if settings already exist
    const existingSettings = await prisma.siteSettings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          logoUrl: logoUrl || existingSettings.logoUrl,
          faviconUrl: faviconUrl || existingSettings.faviconUrl,
        }
      });
    } else {
      // Create new settings
      settings = await prisma.siteSettings.create({
        data: {
          logoUrl,
          faviconUrl,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Site settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

// PUT - Update specific field
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = SiteSettingsSchema.parse(body);

    // Get existing settings or create if none exist
    let existingSettings = await prisma.siteSettings.findFirst();
    
    if (!existingSettings) {
      // Create new settings
      const newSettings = await prisma.siteSettings.create({
        data: {
          ...validatedData,
          smtpEnabled: validatedData.smtpEnabled ?? false,
          smtpPort: validatedData.smtpPort ?? 587,
          smtpSecure: validatedData.smtpSecure ?? true,
          emailBrandingEnabled: validatedData.emailBrandingEnabled ?? true,
          emailLoggingEnabled: validatedData.emailLoggingEnabled ?? true,
          emailRateLimitPerHour: validatedData.emailRateLimitPerHour ?? 100,
        },
      });

      const { smtpPassword, ...safeSiteSettings } = newSettings;
      return NextResponse.json(safeSiteSettings);
    } else {
      // Update existing settings
      const updatedSettings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: validatedData,
      });

      const { smtpPassword, ...safeSiteSettings } = updatedSettings;
      return NextResponse.json(safeSiteSettings);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
} 