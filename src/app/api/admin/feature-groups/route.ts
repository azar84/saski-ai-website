import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreateFeatureGroupSchema, UpdateFeatureGroupSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

// GET - Fetch all feature groups
export async function GET() {
  try {
    console.log('Attempting to fetch feature groups...');
    
    // Start with a simple query first
    const featureGroups = await prisma.featureGroup.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found feature groups:', featureGroups.length);

    const response: ApiResponse = {
      success: true,
      data: featureGroups
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch feature groups:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch feature groups'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new feature group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreateFeatureGroupSchema, body);

    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: validatedData.name,
        heading: validatedData.heading,
        subheading: validatedData.subheading || null,
        isActive: validatedData.isActive
      },
      include: {
        groupItems: {
          include: {
            feature: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        pageAssignments: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            groupItems: true,
            pageAssignments: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: featureGroup
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create feature group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create feature group'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a feature group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateFeatureGroupSchema, body);

    const featureGroup = await prisma.featureGroup.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.heading !== undefined && { heading: validatedData.heading }),
        ...(validatedData.subheading !== undefined && { subheading: validatedData.subheading }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        updatedAt: new Date()
      },
      include: {
        groupItems: {
          include: {
            feature: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        pageAssignments: {
          include: {
            page: {
              select: {
                id: true,
                slug: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            groupItems: true,
            pageAssignments: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: featureGroup
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update feature group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update feature group'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a feature group
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      const response: ApiResponse = {
        success: false,
        message: 'Valid feature group ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.featureGroup.delete({
      where: { id: parseInt(id.toString()) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Feature group deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete feature group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete feature group'
    };
    return NextResponse.json(response, { status: 500 });
  }
}