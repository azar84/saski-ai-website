import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
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
  // Using static data for now since we removed Strapi
  const data = await getHomepageData();
  const homePage = await getHomePage();

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F1A2A] transition-colors duration-300">
      <Header />
      
      <Suspense fallback={<SectionSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturesSection pageSlug="home" />
      </Suspense>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#5243E9] to-[#7C3AED] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Customer Communication?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Saski AI to automate their customer interactions and boost conversions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[#5243E9] rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-[#5243E9] transition-colors duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
