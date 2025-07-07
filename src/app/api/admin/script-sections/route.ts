import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errorHandling';

// GET - Fetch all script sections
export async function GET() {
  try {
    const scriptSections = await prisma.scriptSection.findMany({
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: scriptSections
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch script sections');
  }
}

// POST - Create a new script section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      scriptType = 'javascript',
      scriptContent,
      placement = 'footer',
      isActive = true,
      loadAsync = false,
      loadDefer = false,
      priority = 0
    } = body;

    // Validate required fields
    if (!name || !scriptContent) {
      return NextResponse.json({
        success: false,
        error: 'Name and script content are required'
      }, { status: 400 });
    }

    // Validate script type
    const validScriptTypes = ['javascript', 'google-analytics', 'google-tag-manager', 'custom'];
    if (!validScriptTypes.includes(scriptType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid script type'
      }, { status: 400 });
    }

    // Validate placement
    const validPlacements = ['header', 'footer', 'body-start', 'body-end'];
    if (!validPlacements.includes(placement)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid placement'
      }, { status: 400 });
    }

    const scriptSection = await prisma.scriptSection.create({
      data: {
        name,
        description,
        scriptType,
        scriptContent,
        placement,
        isActive,
        loadAsync,
        loadDefer,
        priority
      }
    });

    return NextResponse.json({
      success: true,
      data: scriptSection
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'A script section with this name already exists'
      }, { status: 400 });
    }
    return handleApiError(error, 'Failed to create script section');
  }
}

// PUT - Update a script section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      id,
      name,
      description,
      scriptType,
      scriptContent,
      placement,
      isActive,
      loadAsync,
      loadDefer,
      priority
    } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Script section ID is required'
      }, { status: 400 });
    }

    // Check if script section exists
    const existingScript = await prisma.scriptSection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingScript) {
      return NextResponse.json({
        success: false,
        error: 'Script section not found'
      }, { status: 404 });
    }

    // Validate script type if provided
    if (scriptType) {
      const validScriptTypes = ['javascript', 'google-analytics', 'google-tag-manager', 'custom'];
      if (!validScriptTypes.includes(scriptType)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid script type'
        }, { status: 400 });
      }
    }

    // Validate placement if provided
    if (placement) {
      const validPlacements = ['header', 'footer', 'body-start', 'body-end'];
      if (!validPlacements.includes(placement)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid placement'
        }, { status: 400 });
      }
    }

    const updatedScript = await prisma.scriptSection.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(scriptType && { scriptType }),
        ...(scriptContent && { scriptContent }),
        ...(placement && { placement }),
        ...(isActive !== undefined && { isActive }),
        ...(loadAsync !== undefined && { loadAsync }),
        ...(loadDefer !== undefined && { loadDefer }),
        ...(priority !== undefined && { priority })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedScript
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'A script section with this name already exists'
      }, { status: 400 });
    }
    return handleApiError(error, 'Failed to update script section');
  }
}

// DELETE - Delete a script section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Script section ID is required'
      }, { status: 400 });
    }

    // Check if script section exists
    const existingScript = await prisma.scriptSection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingScript) {
      return NextResponse.json({
        success: false,
        error: 'Script section not found'
      }, { status: 404 });
    }

    // Check if script section is being used in any page sections
    const usageCount = await prisma.pageSection.count({
      where: { scriptSectionId: parseInt(id) }
    });

    if (usageCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete script section. It is being used in ${usageCount} page section(s).`
      }, { status: 400 });
    }

    await prisma.scriptSection.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Script section deleted successfully'
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete script section');
  }
} 