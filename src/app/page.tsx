import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';
import { getHomepageData } from '@/lib/api';

interface HomePage {
  id: number;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDesc?: string;
}

async function getHomePage(): Promise<HomePage | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/pages`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const pages = data.data || [];
    
    return pages.find((page: HomePage) => page.slug === 'home') || null;
  } catch (error) {
    console.error('Failed to fetch home page:', error);
    return null;
  }
}

// Loading components
const SectionSkeleton = () => (
  <div className="animate-pulse py-24">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3 mx-auto"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-2/3 mx-auto"></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
);

export default async function Home() {
  const data = await getHomepageData();
  const homePage = await getHomePage();

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F1A2A] transition-colors duration-300">
      <Header />
      <HeroSection />
      <div>
        {/* Dynamic Page Content from Page Builder */}
        <Suspense fallback={<SectionSkeleton />}>
          <DynamicPageRenderer pageSlug="home" />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
