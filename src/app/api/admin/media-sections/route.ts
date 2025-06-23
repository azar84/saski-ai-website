import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET - Fetch media sections (optionally filtered by pageId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    const mediaSections = await prisma.mediaSection.findMany({
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
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: mediaSections
    });
  } catch (error) {
    console.error('Failed to fetch media sections:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch media sections' },
      { status: 500 }
    );
  }
}

// POST - Create a new media section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, heading, subheading, imageUrl, videoUrl, position = 0, visible = true } = body;

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

    const mediaSection = await prisma.mediaSection.create({
      data: {
        pageId,
        heading,
        subheading,
        imageUrl,
        videoUrl,
        position,
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
      data: mediaSection
    });
  } catch (error) {
    console.error('Failed to create media section:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create media section' },
      { status: 500 }
    );
  }
}

// PUT - Update a media section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pageId, heading, subheading, imageUrl, videoUrl, position, visible } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Media section ID is required' },
        { status: 400 }
      );
    }

    const mediaSection = await prisma.mediaSection.update({
      where: { id },
      data: {
        ...(pageId && { pageId }),
        heading,
        subheading,
        imageUrl,
        videoUrl,
        ...(typeof position === 'number' && { position }),
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
      data: mediaSection
    });
  } catch (error) {
    console.error('Failed to update media section:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update media section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a media section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Media section ID is required' },
        { status: 400 }
      );
    }

    await prisma.mediaSection.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Media section deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete media section:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete media section' },
      { status: 500 }
    );
  }
} 