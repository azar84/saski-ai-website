import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import VideoSection from '@/components/sections/VideoSection';
import ConversationSection from '@/components/sections/ConversationSection';
import SupportSection from '@/components/sections/SupportSection';
import FAQSection from '@/components/sections/FAQSection';
import ProductHuntSection from '@/components/sections/ProductHuntSection';
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

      {/* Video Demo Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <VideoSection />
      </Suspense>

      {/* Conversation Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <ConversationSection />
      </Suspense>

      {/* Support Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <SupportSection />
      </Suspense>

      {/* FAQ Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <FAQSection />
      </Suspense>

      {/* Product Hunt Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProductHuntSection />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">
            Ready to Get Started?
          </h4>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Transform Your Customer Communication Today
          </h2>
          <p className="text-lg lg:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Saski AI to automate their customer interactions and boost conversions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[var(--color-primary)] rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-[var(--color-primary)] transition-colors duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
