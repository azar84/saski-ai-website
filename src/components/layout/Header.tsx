'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ClientHeader from './ClientHeader';

// Import the CTAButton type from ClientHeader
interface CTAButton {
  text: string;
  url: string;
  icon?: string;
  style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  target: '_self' | '_blank';
}

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

interface HeaderConfig {
  id: number;
  isActive: boolean;
  backgroundColor: string;
  menuTextColor: string;
  menuHoverColor: string;
  menuActiveColor: string;
  navItems: any[];
  headerCTAs: any[];
  menus: any[];
}

export default function Header() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        // Fetch header configuration from API
        const headerResponse = await fetch('/api/admin/header-config');
        const headerData = await headerResponse.json();
        
        // Fetch site settings from API
        const settingsResponse = await fetch('/api/admin/site-settings');
        const settingsData = await settingsResponse.json();

        // Handle header config response (returns array directly)
        if (Array.isArray(headerData) && headerData.length > 0) {
          setHeaderConfig(headerData[0]); // Get the first active config
        }
        
        if (settingsData.success && settingsData.data) {
          setSiteSettings(settingsData.data);
        }

        // Debug info only in development
        if (process.env.NODE_ENV === 'development') {
          console.log('=== HEADER COMPONENT DEBUG ===');
          console.log('Header - Header config fetched:', headerData.length > 0 ? 'FOUND' : 'NOT FOUND');
          if (headerData.length > 0) {
            const config = headerData[0];
            console.log('Header - Header config ID:', config.id);
            console.log('Header - Is active:', config.isActive);
            console.log('Header - Background color:', config.backgroundColor);
            console.log('Header - Nav items count:', config.navItems?.length || 0);
            console.log('Header - CTA buttons count:', config.headerCTAs?.length || 0);
            console.log('Header - Menu count:', config.menus?.length || 0);
            if (config.menus?.length > 0) {
              console.log('Header - Menu items:', config.menus[0]?.menu?.items?.length || 0);
            }
          }
          console.log('Header - Site settings fetched:', settingsData.data ? 'FOUND' : 'NOT FOUND');
          console.log('==============================');
        }
      } catch (error) {
        console.error('Failed to fetch header data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();
  }, []);

  if (loading) {
    return <div className="h-16 bg-white"></div>; // Loading placeholder
  }

  // Generate navigation items from header configuration
  let navigationItems: Array<{name: string; href: string; isActive: boolean; children?: Array<{name: string; href: string; isActive: boolean}>}> = [];
  let ctaButtons: CTAButton[] = [];
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
      const topLevelItems = headerConfig.menus[0].menu.items.filter((item: any) => !item.parentId);
      navigationItems = topLevelItems.map((item: any) => ({
        name: item.label,
        href: item.url || (item.page?.slug === 'home' ? '/' : `/${item.page?.slug}`) || '#',
        isActive: false,
        children: item.children?.map((child: any) => ({
          name: child.label,
          href: child.url || (child.page?.slug === 'home' ? '/' : `/${child.page?.slug}`) || '#',
          isActive: false
        })) || []
      }));
    } else if (headerConfig.navItems.length > 0) {
      // Fallback to direct nav items if no menu is selected
      navigationItems = headerConfig.navItems.map((item: any) => ({
        name: item.customText || item.page?.title || '',
        href: item.customUrl || (item.page?.slug === 'home' ? '/' : `/${item.page?.slug}`) || '',
        isActive: false
      }));
    }

    // Get CTA buttons
    ctaButtons = headerConfig.headerCTAs.map((item: any) => ({
      text: item.cta.text,
      url: item.cta.url,
      ...(item.cta.icon && { icon: item.cta.icon }),
      style: item.cta.style as "info" | "primary" | "secondary" | "accent" | "ghost" | "destructive" | "success" | "outline" | "muted",
      target: item.cta.target as "_self" | "_blank"
    }));

    // Debug the mapped data
    if (process.env.NODE_ENV === 'development') {
      console.log('Header - Mapped navigation items:', navigationItems);
      console.log('Header - Mapped CTA buttons:', ctaButtons);
      console.log('Header - Background color:', backgroundColor);
    }
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
