import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Check if the page exists by making a server-side request
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/page-sections?pageSlug=${slug}`, {
      cache: 'no-store'
    });
    
    if (response.status === 404) {
      notFound();
    }
  } catch (error) {
    console.error('Error checking page existence:', error);
    // If there's an error checking, let the component handle it
  }
  
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        {/* Dynamic Page Content from Page Builder */}
        <DynamicPageRenderer pageSlug={slug} />
      </div>
      
      <Footer />
    </main>
  );
} 