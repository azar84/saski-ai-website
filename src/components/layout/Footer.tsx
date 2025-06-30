'use client';

import React, { useEffect, useState } from 'react';
import ClientFooter from './ClientFooter';

interface Page {
  id: number;
  slug: string;
  title: string;
  showInFooter: boolean;
  sortOrder: number;
}

export default function Footer() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        console.log('🚀 Footer - Starting to fetch pages...');
        // Fetch pages that should show in footer from API
        const response = await fetch('/api/admin/pages');
        const data = await response.json();
        console.log('🚀 Footer - Pages API response:', data);
        
        if (data.success && data.data) {
          const footerPages = data.data.filter((page: any) => page.showInFooter);
          console.log('🚀 Footer - Filtered footer pages:', footerPages);
          setPages(footerPages);
          
          // Debug info only in development
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Footer - Final pages state:', footerPages);
          }
        }
      } catch (error) {
        console.error('🚀 Footer - Failed to fetch footer data:', error);
        setPages([]);
      } finally {
        console.log('🚀 Footer - Setting loading to false');
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Always render ClientFooter, even during loading and with empty pages
  console.log('🚀 Footer - Rendering with loading:', loading, 'pages:', pages.length);
  
  return <ClientFooter pages={pages} />;
} 
