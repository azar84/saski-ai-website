import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { HomeHeroSchema, UpdateHomeHeroSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

// GET - Fetch home hero data
export async function GET() {
  try {
    const homeHero = await prisma.homePageHero.findFirst({
      where: {
        isActive: true
      },
      include: {
        primaryCta: true,
        secondaryCta: true,
        trustIndicators: {
          where: {
            isVisible: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    // If no home hero exists, return default data
    if (!homeHero) {
      const defaultData = {
        id: null,
        heading: "Automate Conversations, Capture Leads, Serve Customers — All Without Code",
        subheading: "Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.",
        primaryCtaId: null,
        secondaryCtaId: null,
        isActive: true,
        primaryCta: null,
        secondaryCta: null,
        trustIndicators: [
          { iconName: "Shield", text: "99.9% Uptime", sortOrder: 0, isVisible: true },
          { iconName: "Clock", text: "<30s Response", sortOrder: 1, isVisible: true },
          { iconName: "Users", text: "10K+ Customers", sortOrder: 2, isVisible: true },
          { iconName: "Globe", text: "50+ Countries", sortOrder: 3, isVisible: true }
        ]
      };
      
      const response: ApiResponse = {
        success: true,
        data: defaultData
      };
      return NextResponse.json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: homeHero
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch home hero data:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch home hero data'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT - Update home hero data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdateHomeHeroSchema, body);

    // Check if a home hero already exists
    const existingHero = await prisma.homePageHero.findFirst();

    let homeHero;
    
    if (existingHero) {
      // If trust indicators are provided, update them
      if (validatedData.trustIndicators !== undefined) {
        // Delete existing trust indicators
        await prisma.trustIndicator.deleteMany({
          where: { homePageHeroId: existingHero.id }
        });

        // Create new trust indicators
        if (validatedData.trustIndicators && validatedData.trustIndicators.length > 0) {
          await prisma.trustIndicator.createMany({
            data: validatedData.trustIndicators.map((indicator, index) => ({
              homePageHeroId: existingHero.id,
              iconName: indicator.iconName,
              text: indicator.text,
              sortOrder: indicator.sortOrder ?? index,
              isVisible: indicator.isVisible
            }))
          });
        }
      }

      // Update existing hero
      homeHero = await prisma.homePageHero.update({
        where: { id: existingHero.id },
        data: {
          ...(validatedData.heading !== undefined && { heading: validatedData.heading }),
          ...(validatedData.subheading !== undefined && { subheading: validatedData.subheading }),
          ...(validatedData.primaryCtaId !== undefined && { primaryCtaId: validatedData.primaryCtaId }),
          ...(validatedData.secondaryCtaId !== undefined && { secondaryCtaId: validatedData.secondaryCtaId }),
          ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
          updatedAt: new Date()
        },
        include: {
          primaryCta: true,
          secondaryCta: true,
          trustIndicators: {
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });
    } else {
      // Create new hero with validated data
      const createData = validateAndTransform(HomeHeroSchema, body);
      
      homeHero = await prisma.homePageHero.create({
        data: {
          heading: createData.heading,
          subheading: createData.subheading,
          primaryCtaId: createData.primaryCtaId,
          secondaryCtaId: createData.secondaryCtaId,
          isActive: createData.isActive
        },
        include: {
          primaryCta: true,
          secondaryCta: true,
          trustIndicators: {
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });

      // Create trust indicators if provided
      if (createData.trustIndicators && createData.trustIndicators.length > 0) {
        await prisma.trustIndicator.createMany({
          data: createData.trustIndicators.map((indicator, index) => ({
            homePageHeroId: homeHero.id,
            iconName: indicator.iconName,
            text: indicator.text,
            sortOrder: indicator.sortOrder ?? index,
            isVisible: indicator.isVisible
          }))
        });

        // Fetch the updated hero with trust indicators
        homeHero = await prisma.homePageHero.findFirst({
          where: { id: homeHero.id },
          include: {
            primaryCta: true,
            secondaryCta: true,
            trustIndicators: {
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        });
      }
    }

    const response: ApiResponse = {
      success: true,
      data: homeHero,
      message: existingHero ? 'Home hero updated successfully' : 'Home hero created successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update home hero:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update home hero'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
} 