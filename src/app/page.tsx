import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';

// Loading components
const SectionSkeleton = () => (
  <div className="animate-pulse py-24">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/3 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded mb-8 w-2/3 mx-auto"></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
);

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-white">
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
