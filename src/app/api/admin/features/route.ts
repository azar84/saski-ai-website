import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET - Fetch features (optionally filtered by pageId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    const features = await prisma.feature.findMany({
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
      data: features
    });
  } catch (error) {
    console.error('Failed to fetch features:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}

// POST - Create a new feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, iconUrl, heading, subheading, position = 0, visible = true } = body;

    if (!pageId || !heading) {
      return NextResponse.json(
        { success: false, message: 'Page ID and heading are required' },
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

    const feature = await prisma.feature.create({
      data: {
        pageId,
        iconUrl,
        heading,
        subheading,
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
      data: feature
    });
  } catch (error) {
    console.error('Failed to create feature:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create feature' },
      { status: 500 }
    );
  }
}

// PUT - Update a feature
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pageId, iconUrl, heading, subheading, position, visible } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Feature ID is required' },
        { status: 400 }
      );
    }

    const feature = await prisma.feature.update({
      where: { id },
      data: {
        ...(pageId && { pageId }),
        iconUrl,
        ...(heading && { heading }),
        subheading,
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
      data: feature
    });
  } catch (error) {
    console.error('Failed to update feature:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update feature' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a feature
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Feature ID is required' },
        { status: 400 }
      );
    }

    await prisma.feature.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete feature:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete feature' },
      { status: 500 }
    );
  }
} 