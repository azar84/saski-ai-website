'use client';

import { useEffect, useState } from 'react';

export default function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch favicon data from API
    const fetchFavicon = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const settings = data.data;
            const favicon = settings.faviconDarkUrl || settings.faviconUrl || '/favicon.svg';
            setFaviconUrl(favicon);
          }
        }
      } catch (error) {
        console.error('Failed to fetch favicon:', error);
        setFaviconUrl('/favicon.svg');
      }
    };

    fetchFavicon();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !faviconUrl) return;

    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());

    // Add new favicon links
    const favicon = faviconUrl;
    
    // Main favicon
    const link1 = document.createElement('link');
    link1.rel = 'icon';
    link1.href = favicon;
    link1.type = favicon.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
    document.head.appendChild(link1);

    // Shortcut icon for older browsers
    const link2 = document.createElement('link');
    link2.rel = 'shortcut icon';
    link2.href = favicon;
    document.head.appendChild(link2);

    // Apple touch icon
    const link3 = document.createElement('link');
    link3.rel = 'apple-touch-icon';
    link3.href = favicon;
    document.head.appendChild(link3);

    console.log('Dynamic favicon injected:', favicon);
    
    // Additional debug for admin panel
    const isAdminPanel = window.location.pathname.includes('/admin-panel');
    console.log('Current page:', window.location.pathname);
    console.log('Is admin panel:', isAdminPanel);
    
    if (isAdminPanel) {
      console.log('✅ Admin panel confirmed using dark favicon:', favicon);
    }
  }, [faviconUrl]);

  return null; // This component doesn't render anything
} 