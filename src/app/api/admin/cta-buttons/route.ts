import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreateCTASchema, UpdateCTASchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

// GET - Fetch all CTA buttons
export async function GET() {
  try {
    const ctaButtons = await prisma.cTA.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse = {
      success: true,
      data: ctaButtons
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch CTA buttons:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch CTA buttons'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new CTA button
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreateCTASchema, body);

    const ctaButton = await prisma.cTA.create({
      data: {
        text: validatedData.text,
        url: validatedData.url,
        icon: validatedData.icon || null,
        style: validatedData.style,
        target: validatedData.target,
        isActive: validatedData.isActive
      }
    });

    const response: ApiResponse = {
      success: true,
      data: ctaButton
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create CTA button:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create CTA button'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a CTA button
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateCTASchema, body);

    const ctaButton = await prisma.cTA.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.text !== undefined && { text: validatedData.text }),
        ...(validatedData.url !== undefined && { url: validatedData.url }),
        ...(validatedData.icon !== undefined && { icon: validatedData.icon || null }),
        ...(validatedData.style !== undefined && { style: validatedData.style }),
        ...(validatedData.target !== undefined && { target: validatedData.target }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        updatedAt: new Date()
      }
    });

    const response: ApiResponse = {
      success: true,
      data: ctaButton
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update CTA button:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update CTA button'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a CTA button
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      const response: ApiResponse = {
        success: false,
        message: 'Valid CTA button ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // First, remove any header CTA associations
    await prisma.headerCTA.deleteMany({
      where: { ctaId: id }
    });

    // Then delete the CTA button
    await prisma.cTA.delete({
      where: { id: parseInt(id.toString()) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'CTA button deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete CTA button:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete CTA button'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 