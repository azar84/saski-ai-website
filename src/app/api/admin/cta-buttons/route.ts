import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET - Fetch all CTA buttons
export async function GET() {
  try {
    const ctaButtons = await prisma.cTA.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(ctaButtons);
  } catch (error) {
    console.error('Failed to fetch CTA buttons:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch CTA buttons' },
      { status: 500 }
    );
  }
}

// POST - Create a new CTA button
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, url, icon, style = 'primary', target = '_self', isActive = true } = body;

    if (!text || !url) {
      return NextResponse.json(
        { success: false, message: 'Text and URL are required' },
        { status: 400 }
      );
    }

    const ctaButton = await prisma.cTA.create({
      data: {
        text,
        url,
        ...(icon && { icon }),
        style,
        target,
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: ctaButton
    });
  } catch (error) {
    console.error('Failed to create CTA button:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create CTA button' },
      { status: 500 }
    );
  }
}

// PUT - Update a CTA button
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, text, url, icon, style, target, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'CTA button ID is required' },
        { status: 400 }
      );
    }

    const ctaButton = await prisma.cTA.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(url !== undefined && { url }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(style !== undefined && { style }),
        ...(target !== undefined && { target }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: ctaButton
    });
  } catch (error) {
    console.error('Failed to update CTA button:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update CTA button' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a CTA button
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'CTA button ID is required' },
        { status: 400 }
      );
    }

    // First, remove any header CTA associations
    await prisma.headerCTA.deleteMany({
      where: { ctaId: id }
    });

    // Then delete the CTA button
    await prisma.cTA.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'CTA button deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete CTA button:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete CTA button' },
      { status: 500 }
    );
  }
} 