import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET - Fetch hero sections (optionally filtered by pageId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    const heroSections = await prisma.heroSection.findMany({
      where: pageId ? { pageId: parseInt(pageId) } : undefined,
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSections
    });
  } catch (error) {
    console.error('Failed to fetch hero sections:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hero sections' },
      { status: 500 }
    );
  }
}

// POST - Create a new hero section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, heading, subheading, imageUrl, visible = true } = body;

    if (!pageId) {
      return NextResponse.json(
        { success: false, message: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    const heroSection = await prisma.heroSection.create({
      data: {
        pageId,
        heading,
        subheading,
        imageUrl,
        visible
      },
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSection
    });
  } catch (error) {
    console.error('Failed to create hero section:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create hero section' },
      { status: 500 }
    );
  }
}

// PUT - Update a hero section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pageId, heading, subheading, imageUrl, visible } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Hero section ID is required' },
        { status: 400 }
      );
    }

    const heroSection = await prisma.heroSection.update({
      where: { id },
      data: {
        ...(pageId && { pageId }),
        heading,
        subheading,
        imageUrl,
        ...(typeof visible === 'boolean' && { visible })
      },
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSection
    });
  } catch (error) {
    console.error('Failed to update hero section:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update hero section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a hero section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Hero section ID is required' },
        { status: 400 }
      );
    }

    await prisma.heroSection.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Hero section deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete hero section:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete hero section' },
      { status: 500 }
    );
  }
} 