import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import ClientHeader from './ClientHeader';

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  sortOrder: number;
  showInHeader: boolean;
}

interface SiteSettings {
  id: number;
  logoUrl: string | null;
  faviconUrl: string | null;
}

async function getHeaderData() {
  try {
    // Fetch header configuration from database
    const headerConfig = await prisma.headerConfig.findFirst({
      where: {
        isActive: true
      },
      include: {
        navItems: {
          include: {
            page: true
          },
          where: {
            isVisible: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        ctaButtons: {
          include: {
            cta: true
          },
          where: {
            isVisible: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    // Fetch site settings directly from database
    const siteSettings = await prisma.siteSettings.findFirst({
      select: {
        id: true,
        logoUrl: true,
        faviconUrl: true
      }
    });

    // Debug info only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Header - Header config fetched:', JSON.stringify(headerConfig, null, 2));
      console.log('Header - Site settings fetched:', siteSettings);
      
      if (headerConfig) {
        console.log('Header - Nav items count:', headerConfig.navItems?.length || 0);
        console.log('Header - CTA buttons count:', headerConfig.ctaButtons?.length || 0);
        console.log('Header - CTA buttons details:', headerConfig.ctaButtons);
      }
    }

    return { headerConfig, siteSettings };
  } catch (error) {
    console.error('Failed to fetch header data:', error);
    return { headerConfig: null, siteSettings: null };
  }
}

export default async function Header() {
  const { headerConfig, siteSettings } = await getHeaderData();

  // Generate navigation items from header configuration
  let navigationItems: Array<{name: string; href: string; isActive: boolean}> = [];
  let ctaButtons: Array<{text: string; url: string; icon?: string; style: string; target: string}> = [];

  if (headerConfig && headerConfig.navItems.length > 0) {
    // Use header configuration if available
    navigationItems = headerConfig.navItems.map(item => ({
      name: item.customText || item.page?.title || '',
      href: item.customUrl || (item.page?.slug === 'home' ? '/' : `/${item.page?.slug}`) || '',
      isActive: false
    }));

    ctaButtons = headerConfig.ctaButtons.map(item => ({
      text: item.cta.text,
      url: item.cta.url,
      ...(item.cta.icon && { icon: item.cta.icon }),
      style: item.cta.style,
      target: item.cta.target
    }));
  } else {
    // Fallback: fetch pages directly if no header configuration exists
    const pages = await prisma.page.findMany({
      where: {
        showInHeader: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    navigationItems = pages
      .filter(page => page.sortOrder > 0)
      .map(page => ({
        name: page.title,
        href: page.slug === 'home' ? '/' : `/${page.slug}`,
        isActive: false
      }));
  }

  return (
    <ClientHeader 
      navigationItems={navigationItems}
      ctaButtons={ctaButtons}
      siteSettings={siteSettings}
    />
  );
} 