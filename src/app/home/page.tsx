import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';
import { getBaseUrl } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Static metadata
export const metadata = {
  title: 'Home',
  description: 'Welcome to our website.'
};

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDesc?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/pages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const page = result.data.find((p: any) => p.slug === slug);
        if (page) {
          return page;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching page data:', error);
  }

  // If no page found, fetch sections directly
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/page-sections?pageSlug=${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return null;
      }
    }
  } catch (error) {
    console.error('Error fetching sections:', error);
  }

  return null;
}

async function getPageSections(pageSlug: string): Promise<Array<{ id: string; isVisible: boolean; sectionType: string }>> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/page-sections?pageSlug=${pageSlug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return [];
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching page sections:', error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch page data
  const fetchPageData = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/admin/pages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const page = result.data.find((p: any) => p.slug === 'home');
          if (page) {
            return page;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
    return null;
  };

  const page = await fetchPageData();
  
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        {/* Dynamic Page Content from Page Builder */}
        <DynamicPageRenderer pageSlug="home" />
      </div>
      
      <Footer />
    </main>
  );
} 