import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET - Retrieve current site settings
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: settings || { logoUrl: null, faviconUrl: null }
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch site settings' },
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
    const { field, value } = body;

    if (!field || !['logoUrl', 'faviconUrl'].includes(field)) {
      return NextResponse.json(
        { success: false, message: 'Invalid field specified' },
        { status: 400 }
      );
    }

    // Get or create settings
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          logoUrl: field === 'logoUrl' ? value : null,
          faviconUrl: field === 'faviconUrl' ? value : null,
        }
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          [field]: value,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: `${field} updated successfully`
    });
  } catch (error) {
    console.error('Error updating site setting:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update site setting' },
      { status: 500 }
    );
  }
} 