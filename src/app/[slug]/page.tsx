import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServerDynamicPageRenderer from '@/components/sections/ServerDynamicPageRenderer';
import { prisma } from '@/lib/db';

// Force dynamic rendering - ensures SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server-side page existence check
async function checkPageExists(slug: string): Promise<boolean> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      select: { id: true }
    });
    return !!page;
  } catch (error) {
    console.error('Error checking page existence:', error);
    return false;
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Check if page exists - if not, trigger 404
  const pageExists = await checkPageExists(slug);
  if (!pageExists) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        {/* Server-Side Rendered Page Content from Page Builder */}
        <ServerDynamicPageRenderer pageSlug={slug} />
      </div>
      
      <Footer />
    </main>
  );
} 