import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch home page hero data
export async function GET() {
  try {
    const hero = await prisma.homePageHero.findFirst({
      where: { isActive: true },
      include: {
        trustIndicators: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    // If no hero exists, create a default one
    if (!hero) {
      const defaultHero = await prisma.homePageHero.create({
        data: {
          trustIndicators: {
            create: [
              { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0 },
              { iconName: 'Clock', text: '24/7 Support', sortOrder: 1 },
              { iconName: 'Code', text: 'No Code Required', sortOrder: 2 }
            ]
          }
        },
        include: {
          trustIndicators: {
            where: { isVisible: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
      return NextResponse.json(defaultHero);
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error fetching home page hero:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home page hero data' },
      { status: 500 }
    );
  }
}

// PUT - Update home page hero data
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { trustIndicators, ...heroData } = data;

    // First, get the current hero or create one
    let hero = await prisma.homePageHero.findFirst({
      where: { isActive: true }
    });

    if (!hero) {
      hero = await prisma.homePageHero.create({
        data: {}
      });
    }

    // Update the hero data
    const updatedHero = await prisma.homePageHero.update({
      where: { id: hero.id },
      data: heroData,
      include: {
        trustIndicators: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    // Handle trust indicators if provided
    if (trustIndicators && Array.isArray(trustIndicators)) {
      // Delete existing trust indicators
      await prisma.trustIndicator.deleteMany({
        where: { homePageHeroId: hero.id }
      });

      // Create new trust indicators
      if (trustIndicators.length > 0) {
        await prisma.trustIndicator.createMany({
          data: trustIndicators.map((indicator: any, index: number) => ({
            homePageHeroId: hero.id,
            iconName: indicator.iconName,
            text: indicator.text,
            sortOrder: indicator.sortOrder || index,
            isVisible: indicator.isVisible !== false
          }))
        });
      }
    }

    // Fetch the updated hero with trust indicators
    const finalHero = await prisma.homePageHero.findUnique({
      where: { id: hero.id },
      include: {
        trustIndicators: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return NextResponse.json(finalHero);
  } catch (error) {
    console.error('Error updating home page hero:', error);
    return NextResponse.json(
      { error: 'Failed to update home page hero data' },
      { status: 500 }
    );
  }
} 