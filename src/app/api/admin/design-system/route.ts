import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for design system
const DesignSystemSchema = z.object({
  // Brand Colors
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  primaryColorLight: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  primaryColorDark: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  
  // Semantic Colors
  successColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  warningColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  errorColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  infoColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  
  // Neutral Colors
  grayLight: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  grayMedium: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  grayDark: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  
  // Background Colors
  backgroundPrimary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  backgroundSecondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  backgroundDark: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  
  // Text Colors
  textPrimary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  textSecondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  textMuted: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  
  // Typography
  fontFamily: z.string().min(1, 'Font family is required'),
  fontFamilyMono: z.string().min(1, 'Mono font family is required'),
  fontSizeBase: z.string().regex(/^\d+px$/, 'Font size must be in px'),
  lineHeightBase: z.string().regex(/^\d+(\.\d+)?$/, 'Line height must be a number'),
  fontWeightNormal: z.string().regex(/^\d{3}$/, 'Font weight must be 3 digits'),
  fontWeightMedium: z.string().regex(/^\d{3}$/, 'Font weight must be 3 digits'),
  fontWeightBold: z.string().regex(/^\d{3}$/, 'Font weight must be 3 digits'),
  
  // Spacing Scale
  spacingXs: z.string().regex(/^\d+px$/, 'Spacing must be in px'),
  spacingSm: z.string().regex(/^\d+px$/, 'Spacing must be in px'),
  spacingMd: z.string().regex(/^\d+px$/, 'Spacing must be in px'),
  spacingLg: z.string().regex(/^\d+px$/, 'Spacing must be in px'),
  spacingXl: z.string().regex(/^\d+px$/, 'Spacing must be in px'),
  spacing2xl: z.string().regex(/^\d+px$/, 'Spacing must be in px'),
  
  // Border Radius
  borderRadiusSm: z.string().regex(/^\d+px$/, 'Border radius must be in px'),
  borderRadiusMd: z.string().regex(/^\d+px$/, 'Border radius must be in px'),
  borderRadiusLg: z.string().regex(/^\d+px$/, 'Border radius must be in px'),
  borderRadiusXl: z.string().regex(/^\d+px$/, 'Border radius must be in px'),
  borderRadiusFull: z.string().regex(/^\d+px$|^9999px$/, 'Border radius must be in px or 9999px'),
  
  // Shadows
  shadowSm: z.string().min(1, 'Shadow is required'),
  shadowMd: z.string().min(1, 'Shadow is required'),
  shadowLg: z.string().min(1, 'Shadow is required'),
  shadowXl: z.string().min(1, 'Shadow is required'),
  
  // Animation Durations
  animationFast: z.string().regex(/^\d+ms$/, 'Animation duration must be in ms'),
  animationNormal: z.string().regex(/^\d+ms$/, 'Animation duration must be in ms'),
  animationSlow: z.string().regex(/^\d+ms$/, 'Animation duration must be in ms'),
  
  // Breakpoints
  breakpointSm: z.string().regex(/^\d+px$/, 'Breakpoint must be in px'),
  breakpointMd: z.string().regex(/^\d+px$/, 'Breakpoint must be in px'),
  breakpointLg: z.string().regex(/^\d+px$/, 'Breakpoint must be in px'),
  breakpointXl: z.string().regex(/^\d+px$/, 'Breakpoint must be in px'),
  breakpoint2xl: z.string().regex(/^\d+px$/, 'Breakpoint must be in px'),
  
  // Theme Mode
  themeMode: z.enum(['light', 'dark', 'auto']),
  
  // Custom Variables (optional JSON string)
  customVariables: z.string().optional(),
  
  // Meta
  isActive: z.boolean().optional()
});

// GET - Fetch design system settings
export async function GET() {
  try {
    // Get the active design system (there should only be one)
    let designSystem = await prisma.designSystem.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // If no design system exists, create default one
    if (!designSystem) {
      designSystem = await prisma.designSystem.create({
        data: {
          isActive: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: designSystem
    });

  } catch (error) {
    console.error('Failed to fetch design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch design system settings' 
      },
      { status: 500 }
    );
  }
}

// POST - Create new design system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = DesignSystemSchema.parse(body);

    // Deactivate existing design systems
    await prisma.designSystem.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new design system
    const designSystem = await prisma.designSystem.create({
      data: {
        ...validatedData,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: designSystem,
      message: 'Design system created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Failed to create design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create design system' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update design system
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Design system ID is required' },
        { status: 400 }
      );
    }

    const validatedData = DesignSystemSchema.partial().parse(updateData);

    const designSystem = await prisma.designSystem.update({
      where: { id: parseInt(id) },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: designSystem,
      message: 'Design system updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Failed to update design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update design system' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Reset to default design system
export async function DELETE() {
  try {
    // Delete all existing design systems
    await prisma.designSystem.deleteMany({});

    // Create new default design system
    const defaultDesignSystem = await prisma.designSystem.create({
      data: {
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: defaultDesignSystem,
      message: 'Design system reset to defaults successfully'
    });

  } catch (error) {
    console.error('Failed to reset design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to reset design system' 
      },
      { status: 500 }
    );
  }
} 