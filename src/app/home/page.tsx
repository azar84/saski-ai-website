import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPageRenderer from '@/components/sections/DynamicPageRenderer';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Static metadata
export const metadata = {
  title: 'Home',
  description: 'Welcome to our website.'
};

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        {/* Dynamic Page Content from Page Builder */}
        <DynamicPageRenderer pageSlug="home" />
      </div>
      
      <Footer />
    </main>
  );
} 