import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET - Fetch all pages
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: {
        sortOrder: 'asc'
      },
      include: {
        heroSections: true,
        features: true,
        mediaSections: true,
        _count: {
          select: {
            heroSections: true,
            features: true,
            mediaSections: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, metaTitle, metaDesc, sortOrder, showInHeader, showInFooter } = body;

    // Validate required fields
    if (!slug || !title) {
      return NextResponse.json(
        { success: false, message: 'Slug and title are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return NextResponse.json(
        { success: false, message: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    // If no sortOrder provided, set it to the next available number
    let finalSortOrder = sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.page.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    }

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        metaTitle,
        metaDesc,
        sortOrder: finalSortOrder,
        showInHeader: showInHeader !== undefined ? showInHeader : true,
        showInFooter: showInFooter !== undefined ? showInFooter : false
      },
      include: {
        heroSections: true,
        features: true,
        mediaSections: true,
        _count: {
          select: {
            heroSections: true,
            features: true,
            mediaSections: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create page' },
      { status: 500 }
    );
  }
}

// PUT - Update a page
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, slug, title, metaTitle, metaDesc, sortOrder, showInHeader, showInFooter } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current page)
    if (slug) {
      const existingPage = await prisma.page.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      });

      if (existingPage) {
        return NextResponse.json(
          { success: false, message: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        metaTitle,
        metaDesc,
        ...(sortOrder !== undefined && { sortOrder }),
        ...(showInHeader !== undefined && { showInHeader }),
        ...(showInFooter !== undefined && { showInFooter })
      },
      include: {
        heroSections: true,
        features: true,
        mediaSections: true,
        _count: {
          select: {
            heroSections: true,
            features: true,
            mediaSections: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a page
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Page ID is required' },
        { status: 400 }
      );
    }

    await prisma.page.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete page:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete page' },
      { status: 500 }
    );
  }
} 