import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';
import { generatePageMetadataWithJsonLd } from '@/lib/metadata';
import type { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await generatePageMetadataWithJsonLd(slug);
  return result.metadata;
}

async function checkPageExists(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/page-sections?pageSlug=${slug}`, {
      cache: 'no-store'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking page existence:', error);
    return true; // If there's an error, let the component handle it
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Check if page exists - if not, trigger 404
  const pageExists = await checkPageExists(slug);
  if (!pageExists) {
    notFound();
  }

  // Generate JSON-LD for this page
  const metadataResult = await generatePageMetadataWithJsonLd(slug);
  
  return (
    <main className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      {metadataResult.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: metadataResult.jsonLd }}
        />
      )}
      
      <Header />
      
      <div className="pt-20">
        {/* Dynamic Page Content from Page Builder */}
        <DynamicPageRenderer pageSlug={slug} />
      </div>
      
      <Footer />
    </main>
  );
} 