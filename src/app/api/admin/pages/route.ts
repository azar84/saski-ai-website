import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreatePageSchema, UpdatePageSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

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

    const response: ApiResponse = {
      success: true,
      data: pages
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch pages'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreatePageSchema, body);

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingPage) {
      const response: ApiResponse = {
        success: false,
        message: 'A page with this slug already exists'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // If no sortOrder provided, set it to the next available number
    let finalSortOrder = validatedData.sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.page.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    }

    const page = await prisma.page.create({
      data: {
        slug: validatedData.slug,
        title: validatedData.title,
        metaTitle: validatedData.metaTitle || null,
        metaDesc: validatedData.metaDesc || null,
        sortOrder: finalSortOrder,
        showInHeader: validatedData.showInHeader,
        showInFooter: validatedData.showInFooter
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

    const response: ApiResponse = {
      success: true,
      data: page
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create page'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a page
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdatePageSchema, body);

    // Check if slug already exists (excluding current page)
    if (validatedData.slug) {
      const existingPage = await prisma.page.findFirst({
        where: {
          slug: validatedData.slug,
          NOT: { id: validatedData.id }
        }
      });

      if (existingPage) {
        const response: ApiResponse = {
          success: false,
          message: 'A page with this slug already exists'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const page = await prisma.page.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.slug && { slug: validatedData.slug }),
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.metaTitle !== undefined && { metaTitle: validatedData.metaTitle }),
        ...(validatedData.metaDesc !== undefined && { metaDesc: validatedData.metaDesc }),
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
        ...(validatedData.showInHeader !== undefined && { showInHeader: validatedData.showInHeader }),
        ...(validatedData.showInFooter !== undefined && { showInFooter: validatedData.showInFooter })
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

    const response: ApiResponse = {
      success: true,
      data: page
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update page'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a page
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid page ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.page.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Page deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete page'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 