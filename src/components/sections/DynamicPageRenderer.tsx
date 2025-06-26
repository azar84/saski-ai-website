'use client';

import { useState, useEffect } from 'react';
import FeaturesSection from './FeaturesSection';
import MediaSection from './MediaSection';
import FAQSection from './FAQSection';
import DynamicHeroSection from './DynamicHeroSection';
import PricingSection from './PricingSection';
import ConfigurablePricingSection from './ConfigurablePricingSection';

interface PageSection {
  id: number;
  pageId: number;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  isVisible: boolean;
  heroSection?: {
    id: number;
    name?: string;
    layoutType: string;
    sectionHeight?: string;
    tagline?: string;
    headline: string;
    subheading?: string;
    textAlignment: string;
    ctaPrimaryId?: number;
    ctaSecondaryId?: number;
    mediaUrl?: string;
    mediaType: string;
    mediaAlt?: string;
    mediaHeight: string;
    mediaPosition: string;
    backgroundType: string;
    backgroundValue: string;
    showTypingEffect: boolean;
    enableBackgroundAnimation: boolean;
    customClasses?: string;
    paddingTop: number;
    paddingBottom: number;
    containerMaxWidth: string;
    visible: boolean;
    ctaPrimary?: {
      id: number;
      text: string;
      url: string;
      icon?: string;
      style: string;
      target: string;
      isActive: boolean;
    };
    ctaSecondary?: {
      id: number;
      text: string;
      url: string;
      icon?: string;
      style: string;
      target: string;
      isActive: boolean;
    };
  };
  featureGroup?: {
    id: number;
    name: string;
    heading: string;
    subheading?: string;
    layoutType?: 'grid' | 'list';
    isActive: boolean;
    items: Array<{
      id: number;
      sortOrder: number;
      isVisible: boolean;
      feature: {
        id: number;
        title: string;
        description: string;
        iconName: string;
        category: string;
        sortOrder: number;
        isVisible: boolean;
      };
    }>;
  };
  mediaSection?: {
    id: number;
    headline: string;
    subheading?: string;
    mediaUrl: string;
    mediaType: string;
    layoutType: string;
    badgeText?: string;
    isActive: boolean;
    position: number;
    alignment: string;
    mediaSize: string;
    mediaPosition: string;
    showBadge: boolean;
    showCtaButton: boolean;
    ctaText?: string;
    ctaUrl?: string;
    ctaStyle: string;
    enableScrollAnimations: boolean;
    animationType: string;
    backgroundStyle: string;
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
    containerMaxWidth: string;
    features: Array<{
      id: number;
      icon: string;
      label: string;
      color: string;
      sortOrder: number;
    }>;
  };
  pricingSection?: {
    id: number;
    name: string;
    heading: string;
    subheading?: string;
    layoutType: string;
    isActive: boolean;
  };
}

interface DynamicPageRendererProps {
  pageSlug: string;
  className?: string;
}

const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({ 
  pageSlug, 
  className = '' 
}) => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageSections = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/page-sections?pageSlug=${pageSlug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch page sections');
        }
        
        const result = await response.json();
        
        console.log('🔍 DynamicPageRenderer - Raw API Response:', result);
        
        if (result.success && result.data) {
          // Filter visible sections and sort by sortOrder
          const visibleSections = result.data
            .filter((section: PageSection) => section.isVisible)
            .sort((a: PageSection, b: PageSection) => a.sortOrder - b.sortOrder);
          
          console.log('🔍 DynamicPageRenderer - Filtered Sections:', visibleSections.map((s: PageSection) => ({
            id: s.id,
            sectionType: s.sectionType,
            title: s.title,
            featureGroup: s.featureGroup ? {
              id: s.featureGroup.id,
              name: s.featureGroup.name,
              layoutType: s.featureGroup.layoutType
            } : null
          })));
          
          setSections(visibleSections);
        } else {
          throw new Error(result.message || 'Failed to load page content');
        }
      } catch (err) {
        console.error('Error fetching page sections:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    if (pageSlug) {
      fetchPageSections();
    }
  }, [pageSlug]);

  const renderSection = (section: PageSection) => {
    const sectionKey = `${section.sectionType}-${section.id}`;
    
    switch (section.sectionType) {
      case 'hero':
        if (section.heroSection) {
          return (
            <DynamicHeroSection
              key={sectionKey}
              heroSection={section.heroSection}
              overrideTitle={section.title}
              overrideSubtitle={section.subtitle}
              className={className}
            />
          );
        }
        break;

      case 'features':
        if (section.featureGroup) {
          const features = section.featureGroup.items
            .filter(item => item.isVisible)
            .map(item => item.feature)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          console.log('🎨 DynamicPageRenderer - Feature Group:', {
            name: section.featureGroup.name,
            layoutType: section.featureGroup.layoutType,
            featuresCount: features.length
          });

          const propsToPass = {
            features: features as any,
            heading: section.title || section.featureGroup.heading,
            subheading: section.subtitle || section.featureGroup.subheading,
            layoutType: section.featureGroup.layoutType || 'grid'
          };

          console.log('🚀 DynamicPageRenderer - Passing props to FeaturesSection:', propsToPass);

          return (
            <FeaturesSection
              key={sectionKey}
              {...propsToPass}
            />
          );
        }
        break;

      case 'media':
        if (section.mediaSection) {
          const media = section.mediaSection;
          
          // Use universal MediaSection component that can render any media section type
          return (
            <MediaSection
              key={sectionKey}
              {...media}
              className={className}
            />
          );
        }
        break;

      case 'faq':
        return (
          <FAQSection
            key={sectionKey}
            heading={section.title || 'Frequently Asked Questions'}
            className={className}
          />
        );

      case 'testimonials':
        return (
          <section key={sectionKey} className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || 'What Our Customers Say'}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {section.subtitle || 'Testimonials section coming soon...'}
                </p>
              </div>
            </div>
          </section>
        );

      case 'pricing':
        if (section.pricingSection) {
          return (
            <ConfigurablePricingSection
              key={sectionKey}
              heading={section.title || section.pricingSection.heading}
              subheading={section.subtitle || section.pricingSection.subheading}
              pricingSectionId={section.pricingSection.id}
              layoutType={section.pricingSection.layoutType}
            />
          );
        }
        return (
          <section key={sectionKey} className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || 'Pricing Plans'}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {section.subtitle || 'Pricing section coming soon...'}
                </p>
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={sectionKey} className="bg-[#5243E9]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {section.title || 'Ready to Get Started?'}
                </h2>
                <p className="text-white/90 max-w-2xl mx-auto mb-8">
                  {section.subtitle || 'Join thousands of businesses already using our platform.'}
                </p>
                <button className="bg-white text-[#5243E9] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Today
                </button>
              </div>
            </div>
          </section>
        );

      case 'custom':
        return (
          <section key={sectionKey} className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || 'Custom Section'}
                </h2>
                {section.subtitle && (
                  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    {section.subtitle}
                  </p>
                )}
                {section.content && (
                  <div className="prose prose-lg max-w-none mx-auto">
                    <pre className="bg-gray-100 p-4 rounded-lg text-left">
                      {section.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section key={sectionKey} className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {section.title || `${section.sectionType} Section`}
                </h2>
                <p className="text-gray-600">
                  {section.subtitle || `${section.sectionType} section coming soon...`}
                </p>
              </div>
            </div>
          </section>
        );
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-24">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-48 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-24 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Content Loading Error
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#5243E9] text-white px-6 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className={`py-24 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Content Available
            </h2>
            <p className="text-gray-600 mb-4">
              This page doesn't have any content sections configured yet.
            </p>
            <p className="text-sm text-gray-500">
              Use the Page Builder in the admin panel to add content to this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {sections.map(section => renderSection(section))}
    </div>
  );
};

export default DynamicPageRenderer; 
