import React from 'react';
import { prisma } from '@/lib/db';
import Link from 'next/link';

import FeaturesSection from './FeaturesSection';
import MediaSection from './MediaSection';
import FAQSection from './FAQSection';
import DynamicHeroSection from './DynamicHeroSection';
import HeroSection from './HeroSection';
import PricingSection from './PricingSection';
import ConfigurablePricingSection from './ConfigurablePricingSection';
import FormSection from './FormSection';
import HtmlSection from './HtmlSection';

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
    description?: string;
    layoutType?: 'grid' | 'list';
    backgroundColor?: string;
    isActive: boolean;
    items: Array<{
      id: number;
      sortOrder: number;
      isVisible: boolean;
      feature: {
        id: number;
        name: string;
        description: string;
        iconUrl: string;
        category: string;
        sortOrder: number;
        isActive: boolean;
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
  faqSection?: {
    id: number;
    name: string;
    heading: string;
    subheading?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    searchPlaceholder?: string;
    showHero: boolean;
    showCategories: boolean;
    backgroundColor?: string;
    heroBackgroundColor?: string;
    heroHeight?: string;
    isActive: boolean;
    sectionCategories?: Array<{
      id: number;
      categoryId: number;
      sortOrder: number;
      category: {
        id: number;
        name: string;
        description?: string;
        icon?: string;
        color: string;
        sortOrder: number;
        isActive: boolean;
        _count: {
          faqs: number;
        };
      };
    }>;
  };
  faqCategoryId?: number;
  form?: {
    id: number;
    name: string;
    title: string;
    subheading?: string;
    isActive: boolean;
    _count: {
      fields: number;
      submissions: number;
    };
  };
  formId?: number;
  htmlSection?: {
    id: number;
    name: string;
    description?: string;
    htmlContent: string;
    cssContent?: string;
    jsContent?: string;
    isActive: boolean;
  };
}

interface ServerDynamicPageRendererProps {
  pageSlug: string;
  className?: string;
}

// Server-side data fetching
async function fetchPageSections(pageSlug: string): Promise<PageSection[]> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: pageSlug },
      select: { id: true }
    });

    if (!page) {
      return [];
    }

    const sections = await prisma.pageSection.findMany({
      where: {
        pageId: page.id,
        isVisible: true
      },
      include: {
        heroSection: {
          include: {
            ctaPrimary: true,
            ctaSecondary: true
          }
        },
        featureGroup: {
          include: {
            items: {
              include: {
                feature: true
              },
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        mediaSection: {
          include: {
            features: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        pricingSection: true,
        faqSection: {
          include: {
            sectionCategories: {
              include: {
                category: {
                  include: {
                    _count: {
                      select: { faqs: true }
                    }
                  }
                }
              },
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        form: {
          include: {
            _count: {
              select: {
                fields: true,
                submissions: true
              }
            }
          }
        },
        htmlSection: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return sections as PageSection[];
  } catch (error) {
    console.error('Error fetching page sections:', error);
    return [];
  }
}

// Server-side company name fetching
async function fetchCompanyName(): Promise<string> {
  try {
    const siteSettings = await prisma.siteSettings.findFirst();
    return siteSettings?.footerCompanyName || 'Our Company';
  } catch (error) {
    console.error('Error fetching company name:', error);
    return 'Our Company';
  }
}

const ServerDynamicPageRenderer: React.FC<ServerDynamicPageRendererProps> = async ({ 
  pageSlug, 
  className = '' 
}) => {
  // Fetch data on the server
  const [sections, companyName] = await Promise.all([
    fetchPageSections(pageSlug),
    fetchCompanyName()
  ]);

  const generateSectionId = (section: PageSection, index: number) => {
    const sectionType = section.sectionType.toLowerCase();
    const sectionName = section.title || section.heroSection?.name || section.featureGroup?.name || section.mediaSection?.headline || section.pricingSection?.name || section.faqSection?.name || section.form?.name || section.htmlSection?.name || 'section';
    const cleanName = sectionName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `${sectionType}-${cleanName}-${index}`;
  };

  const renderSection = (section: PageSection, index: number) => {
    const sectionId = generateSectionId(section, index);
    
    const wrapWithSectionDiv = (content: React.ReactNode) => (
      <div id={sectionId} className="scroll-mt-20">
        {content}
      </div>
    );

    switch (section.sectionType) {
      case 'hero':
        if (section.heroSection) {
          return wrapWithSectionDiv(
            <DynamicHeroSection 
              key={section.id} 
              heroSection={section.heroSection}
            />
          );
        }
        break;

      case 'features':
        if (section.featureGroup) {
          // Convert feature group data to match FeaturesSection props
          const features = section.featureGroup.items
            .filter(item => item.isVisible)
            .map(item => ({
              id: item.feature.id,
              title: item.feature.name,
              description: item.feature.description,
              iconName: item.feature.iconUrl,
              category: item.feature.category,
              sortOrder: item.feature.sortOrder,
              isVisible: item.feature.isActive,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);

          return wrapWithSectionDiv(
            <FeaturesSection 
              key={section.id} 
              features={features}
              heading={section.featureGroup.name}
              subheading={section.featureGroup.description}
              layoutType={section.featureGroup.layoutType}
              backgroundColor={section.featureGroup.backgroundColor}
            />
          );
        }
        break;

      case 'media':
        if (section.mediaSection) {
          return wrapWithSectionDiv(
            <MediaSection 
              key={section.id} 
              id={section.mediaSection.id}
              headline={section.mediaSection.headline}
              subheading={section.mediaSection.subheading}
              mediaUrl={section.mediaSection.mediaUrl}
              mediaType={section.mediaSection.mediaType}
              layoutType={section.mediaSection.layoutType}
              badgeText={section.mediaSection.badgeText}
              isActive={section.mediaSection.isActive}
              position={section.mediaSection.position}
              alignment={section.mediaSection.alignment}
              mediaSize={section.mediaSection.mediaSize}
              mediaPosition={section.mediaSection.mediaPosition}
              showBadge={section.mediaSection.showBadge}
              showCtaButton={section.mediaSection.showCtaButton}
              ctaText={section.mediaSection.ctaText}
              ctaUrl={section.mediaSection.ctaUrl}
              ctaStyle={section.mediaSection.ctaStyle}
              enableScrollAnimations={section.mediaSection.enableScrollAnimations}
              animationType={section.mediaSection.animationType}
              backgroundStyle={section.mediaSection.backgroundStyle}
              backgroundColor={section.mediaSection.backgroundColor}
              textColor={section.mediaSection.textColor}
              paddingTop={section.mediaSection.paddingTop}
              paddingBottom={section.mediaSection.paddingBottom}
              containerMaxWidth={section.mediaSection.containerMaxWidth}
              features={section.mediaSection.features}
            />
          );
        }
        break;

      case 'pricing':
        if (section.pricingSection) {
          // TODO: Fix ConfigurablePricingSection props for SSR
          return wrapWithSectionDiv(
            <div key={section.id} className="py-16 bg-gray-50">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.pricingSection.name}
                </h2>
                <p className="text-gray-600">
                  Pricing section - SSR implementation pending
                </p>
              </div>
            </div>
          );
        }
        break;

      case 'faq':
        if (section.faqSection) {
          return wrapWithSectionDiv(
            <FAQSection 
              key={section.id} 
              heading={section.faqSection.heading}
              subheading={section.faqSection.subheading}
              heroTitle={section.faqSection.heroTitle}
              heroSubtitle={section.faqSection.heroSubtitle}
              searchPlaceholder={section.faqSection.searchPlaceholder}
              showHero={section.faqSection.showHero}
              showCategories={section.faqSection.showCategories}
              backgroundColor={section.faqSection.backgroundColor}
              heroBackgroundColor={section.faqSection.heroBackgroundColor}
              heroHeight={section.faqSection.heroHeight}
              sectionCategories={section.faqSection.sectionCategories?.map(sc => sc.categoryId) || []}
            />
          );
        }
        break;

      case 'form':
        if (section.form) {
          // TODO: Fix FormSection props for SSR
          return wrapWithSectionDiv(
            <div key={section.id} className="py-16 bg-gray-50">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.form.title}
                </h2>
                <p className="text-gray-600">
                  Form section - SSR implementation pending
                </p>
              </div>
            </div>
          );
        }
        break;

      case 'html':
        if (section.htmlSection) {
          return wrapWithSectionDiv(
            <HtmlSection 
              key={section.id} 
              htmlSection={section.htmlSection}
            />
          );
        }
        break;

      default:
        return wrapWithSectionDiv(
          <div key={section.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Unknown Section Type: {section.sectionType}
              </h2>
              <p className="text-gray-600">
                This section type is not yet supported in the page builder.
              </p>
            </div>
          </div>
        );
    }
  };

  if (sections.length === 0) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The page you're looking for doesn't exist or has no content sections.
            </p>
            <Link 
              href="/home" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default ServerDynamicPageRenderer; 