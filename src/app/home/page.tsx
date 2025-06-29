import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';

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
    const response = await fetch(`/api/admin/pages`, {
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
    const response = await fetch(`/api/admin/page-sections?pageSlug=${slug}`, {
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
    const response = await fetch(`/api/admin/page-sections?pageSlug=${pageSlug}`, {
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

export async function generateMetadata() {
  const page = await getPageBySlug('home');
  
  if (!page) {
    return {
      title: 'Home',
      description: 'Welcome to our website.'
    };
  }
  
  return {
    title: page.metaTitle || page.title || 'Home',
    description: page.metaDesc || 'Welcome to our website.',
  };
}

export default async function HomePage() {
  // Fetch page data
  const fetchPageData = async () => {
    try {
      const response = await fetch(`/api/admin/pages`, {
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
  
  // Check if there are any sections for this page
  const sections = await getPageSections('home');
  const hasSections = sections.filter((section) => section.isVisible).length > 0;
  
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        {/* Dynamic Page Content from Page Builder */}
        <DynamicPageRenderer pageSlug="home" />
        
        {/* Fallback Content if no sections are configured */}
        {!hasSections && (
          <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                    {page?.title || 'Welcome'}
                  </h1>
                  {page?.metaDesc && (
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      {page.metaDesc}
                    </p>
                  )}
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Welcome to our website. This is the home page configured to display dynamic content 
                    from the Page Builder. If you don't see any content above, it means no sections have 
                    been added to this page yet.
                  </p>
                  
                  <p className="text-lg text-gray-600 leading-relaxed mt-6">
                    To add content to this page, go to the admin panel and use the Page Builder to add 
                    sections like hero banners, features, media sections, and more.
                  </p>
                  
                  <div className="mt-12 p-8 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      Page Information
                    </h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-gray-900">Title:</dt>
                        <dd className="text-gray-600">{page?.title || 'Home'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-900">Slug:</dt>
                        <dd className="text-gray-600">/home</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-900">Meta Title:</dt>
                        <dd className="text-gray-600">{page?.metaTitle || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-900">Created:</dt>
                        <dd className="text-gray-600">
                          {page?.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'Not available'}
                        </dd>
                      </div>
                    </dl>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Admin Tip:</strong> Use the Page Builder in the admin panel to add 
                        hero sections, features, media sections, FAQs, and more to this page. The content 
                        will automatically appear above this information section.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      
      <Footer />
    </main>
  );
} 