import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET - Fetch header configuration
export async function GET() {
  try {
    const headerConfigs = await prisma.headerConfig.findMany({
      where: {
        isActive: true
      },
              include: {
          navItems: {
            include: {
              page: true
            },
            orderBy: {
              sortOrder: 'asc'
            }
          },
          ctaButtons: {
            include: {
              cta: true
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
    });

    return NextResponse.json(headerConfigs);
  } catch (error) {
    console.error('Failed to fetch header config:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch header configuration' },
      { status: 500 }
    );
  }
}

// POST - Create or update header configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { navItems, ctaButtons } = body;

    // First, deactivate all existing configs
    await prisma.headerConfig.updateMany({
      data: { isActive: false }
    });

    // Create new header config
    const headerConfig = await prisma.headerConfig.create({
      data: {
        isActive: true,
        navItems: {
          create: navItems?.map((item: any, index: number) => ({
            pageId: item.pageId,
            label: item.label || item.customText || '',
            sortOrder: item.sortOrder || index,
            isVisible: item.isVisible !== undefined ? item.isVisible : true
          })) || []
        },
        ctaButtons: {
          create: ctaButtons?.map((item: any, index: number) => ({
            ctaId: item.ctaId,
            sortOrder: item.sortOrder || index,
            isVisible: item.isVisible !== undefined ? item.isVisible : true
          })) || []
        }
      },
      include: {
        navItems: {
          include: {
            page: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        ctaButtons: {
          include: {
            cta: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: headerConfig
    });
  } catch (error) {
    console.error('Failed to create header config:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create header configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update existing header configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, navItems, ctaButtons, action, ctaId, headerCtaId, isVisible } = body;

    // Handle specific actions for CTA management
    if (action) {
      switch (action) {
        case 'addCta':
          return await addCtaToHeader(ctaId);
        case 'removeCta':
          return await removeCtaFromHeader(headerCtaId);
        case 'toggleCtaVisibility':
          return await toggleCtaVisibility(headerCtaId, isVisible);
        default:
          return NextResponse.json(
            { success: false, message: 'Unknown action' },
            { status: 400 }
          );
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Header config ID is required' },
        { status: 400 }
      );
    }

    // Delete existing nav items and CTA buttons
    await prisma.headerNavItem.deleteMany({
      where: { headerConfigId: id }
    });

    await prisma.headerCTA.deleteMany({
      where: { headerConfigId: id }
    });

    // Update header config with new items
    const headerConfig = await prisma.headerConfig.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        navItems: {
          create: navItems?.map((item: any, index: number) => ({
            pageId: item.pageId,
            label: item.label || item.customText || '',
            sortOrder: item.sortOrder || index,
            isVisible: item.isVisible !== undefined ? item.isVisible : true
          })) || []
        },
        ctaButtons: {
          create: ctaButtons?.map((item: any, index: number) => ({
            ctaId: item.ctaId,
            sortOrder: item.sortOrder || index,
            isVisible: item.isVisible !== undefined ? item.isVisible : true
          })) || []
        }
      },
      include: {
        navItems: {
          include: {
            page: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        ctaButtons: {
          include: {
            cta: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: headerConfig
    });
  } catch (error) {
    console.error('Failed to update header config:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update header configuration' },
      { status: 500 }
    );
  }
}

// Helper function to add CTA to header
async function addCtaToHeader(ctaId: number) {
  try {
    // Get the active header config
    const headerConfig = await prisma.headerConfig.findFirst({
      where: { isActive: true },
      include: { ctaButtons: true }
    });

    if (!headerConfig) {
      return NextResponse.json(
        { success: false, message: 'No active header configuration found' },
        { status: 404 }
      );
    }

    // Check if CTA is already in header
    const existingCta = await prisma.headerCTA.findFirst({
      where: {
        headerConfigId: headerConfig.id,
        ctaId: ctaId
      }
    });

    if (existingCta) {
      return NextResponse.json(
        { success: false, message: 'CTA already in header' },
        { status: 400 }
      );
    }

    // Add CTA to header
    await prisma.headerCTA.create({
      data: {
        headerConfigId: headerConfig.id,
        ctaId: ctaId,
        sortOrder: headerConfig.ctaButtons.length,
        isVisible: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add CTA to header:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add CTA to header' },
      { status: 500 }
    );
  }
}

// Helper function to remove CTA from header
async function removeCtaFromHeader(headerCtaId: number) {
  try {
    await prisma.headerCTA.delete({
      where: { id: headerCtaId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove CTA from header:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove CTA from header' },
      { status: 500 }
    );
  }
}

// Helper function to toggle CTA visibility
async function toggleCtaVisibility(headerCtaId: number, isVisible: boolean) {
  try {
    await prisma.headerCTA.update({
      where: { id: headerCtaId },
      data: { isVisible }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to toggle CTA visibility:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle CTA visibility' },
      { status: 500 }
    );
  }
} 