import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
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