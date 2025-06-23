import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  createdAt: string;
  updatedAt: string;
}

async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/pages`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const pages = data.data || [];
    
    return pages.find((page: Page) => page.slug === slug) || null;
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);
  
  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }
  
  return {
    title: page.metaTitle || page.title,
    description: page.metaDesc || `Learn more about ${page.title}`,
  };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);
  
  if (!page) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-[#5243E9] to-[#7C3AED]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                {page.title}
              </h1>
              {page.metaDesc && (
                <p className="text-xl text-white/90 max-w-3xl mx-auto">
                  {page.metaDesc}
                </p>
              )}
            </div>
          </div>
        </section>
        
        {/* Content Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Welcome to the {page.title} page. This is a dynamic page generated from your admin panel.
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed mt-6">
                  You can customize this page content by editing the page template or adding content management 
                  features to your admin panel. This page was created on{' '}
                  {new Date(page.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}.
                </p>
                
                <div className="mt-12 p-8 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Page Details
                  </h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-gray-900">Title:</dt>
                      <dd className="text-gray-600">{page.title}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Slug:</dt>
                      <dd className="text-gray-600">/{page.slug}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Meta Title:</dt>
                      <dd className="text-gray-600">{page.metaTitle || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Created:</dt>
                      <dd className="text-gray-600">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </main>
  );
} 