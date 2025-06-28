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
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
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
        headerCTAs: {
          include: {
            cta: true
          },
          where: {
            isVisible: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        menus: {
          include: {
            menu: {
              include: {
                items: {
                  where: {
                    isActive: true
                  },
                  include: {
                    page: true,
                    children: {
                      where: {
                        isActive: true
                      },
                      include: {
                        page: true
                      },
                      orderBy: {
                        sortOrder: 'asc'
                      }
                    }
                  },
                  orderBy: {
                    sortOrder: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    });

    // Fetch site settings directly from database
    const siteSettings = await prisma.siteSettings.findFirst({
      select: {
        id: true,
        logoUrl: true,
        logoLightUrl: true,
        logoDarkUrl: true,
        faviconUrl: true
      }
    });

    // Debug info only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== HEADER COMPONENT DEBUG ===');
      console.log('Header - Header config fetched:', headerConfig ? 'FOUND' : 'NOT FOUND');
      if (headerConfig) {
        console.log('Header - Header config ID:', headerConfig.id);
        console.log('Header - Is active:', headerConfig.isActive);
        console.log('Header - Background color:', headerConfig.backgroundColor);
        console.log('Header - Nav items count:', headerConfig.navItems?.length || 0);
        console.log('Header - CTA buttons count:', headerConfig.headerCTAs?.length || 0);
        console.log('Header - Menu count:', headerConfig.menus?.length || 0);
        if (headerConfig.menus?.length > 0) {
          console.log('Header - Menu items:', headerConfig.menus[0]?.menu?.items?.length || 0);
        }
      }
      console.log('Header - Site settings fetched:', siteSettings ? 'FOUND' : 'NOT FOUND');
      console.log('==============================');
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
  let navigationItems: Array<{name: string; href: string; isActive: boolean; children?: Array<{name: string; href: string; isActive: boolean}>}> = [];
  let ctaButtons: Array<{text: string; url: string; icon?: string; style: string; target: string}> = [];
  let backgroundColor = '#ffffff'; // Default background color
  let menuTextColor = '#374151'; // Default menu text color
  let menuHoverColor = '#5243E9'; // Default menu hover color
  let menuActiveColor = '#5243E9'; // Default menu active color

  if (headerConfig) {
    // Use colors from header configuration
    backgroundColor = headerConfig.backgroundColor || '#ffffff';
    menuTextColor = headerConfig.menuTextColor || '#374151';
    menuHoverColor = headerConfig.menuHoverColor || '#5243E9';
    menuActiveColor = headerConfig.menuActiveColor || '#5243E9';

    // Get navigation items from selected menu
    if (headerConfig.menus.length > 0 && headerConfig.menus[0].menu.items.length > 0) {
      // Filter only top-level items (parentId is null) but include their children
      const topLevelItems = headerConfig.menus[0].menu.items.filter(item => !item.parentId);
      navigationItems = topLevelItems.map(item => ({
        name: item.label,
        href: item.url || (item.page?.slug === 'home' ? '/' : `/${item.page?.slug}`) || '#',
        isActive: false,
        children: item.children?.map(child => ({
          name: child.label,
          href: child.url || (child.page?.slug === 'home' ? '/' : `/${child.page?.slug}`) || '#',
          isActive: false
        })) || []
      }));
    } else if (headerConfig.navItems.length > 0) {
      // Fallback to direct nav items if no menu is selected
      navigationItems = headerConfig.navItems.map(item => ({
        name: item.customText || item.page?.title || '',
        href: item.customUrl || (item.page?.slug === 'home' ? '/' : `/${item.page?.slug}`) || '',
        isActive: false
      }));
    }

    // Get CTA buttons
    ctaButtons = headerConfig.headerCTAs.map(item => ({
      text: item.cta.text,
      url: item.cta.url,
      ...(item.cta.icon && { icon: item.cta.icon }),
      style: item.cta.style,
      target: item.cta.target
    }));

    // Debug the mapped data
    if (process.env.NODE_ENV === 'development') {
      console.log('Header - Mapped navigation items:', navigationItems);
      console.log('Header - Mapped CTA buttons:', ctaButtons);
      console.log('Header - Background color:', backgroundColor);
    }
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
      backgroundColor={backgroundColor}
      menuTextColor={menuTextColor}
      menuHoverColor={menuHoverColor}
      menuActiveColor={menuActiveColor}
    />
  );
} 
