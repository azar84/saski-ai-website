'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Users, 
  MessageSquare, 
  Settings, 
  Languages, 
  BookOpen,
  Zap,
  Shield,
  Clock,
  Globe,
  Code,
  Award,
  TrendingUp,
  Heart,
  Sparkles,
  Play,
  ArrowRight,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Video,
  Calendar,
  Gift,
  Rocket
} from 'lucide-react';

interface GlobalFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
  category: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturesSectionProps {
  features?: GlobalFeature[];
  featureGroupId?: number;
  pageSlug?: string;
  heading?: string;
  subheading?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  features: propFeatures = [], 
  featureGroupId,
  pageSlug,
  heading: propHeading,
  subheading: propSubheading
}) => {
  const [features, setFeatures] = useState<GlobalFeature[]>(propFeatures);
  const [loading, setLoading] = useState(propFeatures.length === 0);
  const [groupHeading, setGroupHeading] = useState<string>('');
  const [groupSubheading, setGroupSubheading] = useState<string>('');

  // Default fallback features
  const defaultFeatures: GlobalFeature[] = [
    {
      id: 1,
      title: 'Easy to Use',
      description: 'Get started in minutes with a setup anyone can follow, no tech skills needed.',
      iconName: 'Smile',
      category: 'integration',
      sortOrder: 1,
      isVisible: true,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 2,
      title: 'Automated Support',
      description: 'Answer questions, schedule meetings, and create tickets automatically.',
      iconName: 'Users',
      category: 'automation',
      sortOrder: 2,
      isVisible: true,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 3,
      title: 'Multi-Channel Messaging',
      description: 'Talk to customers on WhatsApp, SMS, voice, web, and Facebook seamlessly.',
      iconName: 'MessageSquare',
      category: 'integration',
      sortOrder: 3,
      isVisible: true,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 4,
      title: 'Tool Integrations',
      description: 'Connect with your CRM, calendar, or helpdesk in just a few clicks.',
      iconName: 'Settings',
      category: 'integration',
      sortOrder: 4,
      isVisible: true,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 5,
      title: 'Multilingual by Default',
      description: 'Support customers in 12+ languages, out of the box.',
      iconName: 'Languages',
      category: 'support',
      sortOrder: 5,
      isVisible: true,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 6,
      title: 'Smart Knowledge Base',
      description: 'Use your website, files, or copied text to teach your assistant instantly.',
      iconName: 'BookOpen',
      category: 'ai',
      sortOrder: 6,
      isVisible: true,
      createdAt: '',
      updatedAt: ''
    }
  ];

  // Fetch features from API if not provided via props
  useEffect(() => {
    if (propFeatures.length > 0) {
      setFeatures(propFeatures);
      setGroupHeading(propHeading || 'Why Saski AI?');
      setGroupSubheading(propSubheading || 'Simple. Smart. Built for growing businesses');
      setLoading(false);
      return;
    }

    const fetchFeatures = async () => {
      try {
        let featuresData: GlobalFeature[] = [];
        let heading = 'Why Saski AI?';
        let subheading = 'Simple. Smart. Built for growing businesses';

        // Priority 1: Specific feature group ID
        if (featureGroupId) {
          const response = await fetch(`/api/admin/feature-groups`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const group = result.data.find((g: any) => g.id === featureGroupId && g.isActive);
              if (group) {
                featuresData = group.groupItems
                  .filter((item: any) => item.isVisible)
                  .map((item: any) => item.feature)
                  .sort((a: GlobalFeature, b: GlobalFeature) => a.sortOrder - b.sortOrder);
                heading = group.heading;
                subheading = group.subheading || '';
              }
            }
          }
        }
        
        // Priority 2: Page-specific feature groups
        else if (pageSlug) {
          const pageResponse = await fetch('/api/admin/pages');
          if (pageResponse.ok) {
            const pageResult = await pageResponse.json();
            if (pageResult.success && pageResult.data) {
              const page = pageResult.data.find((p: any) => p.slug === pageSlug);
              if (page) {
                const groupResponse = await fetch(`/api/admin/page-feature-groups?pageId=${page.id}`);
                if (groupResponse.ok) {
                  const groupResult = await groupResponse.json();
                  if (groupResult.success && groupResult.data && groupResult.data.length > 0) {
                    // Use the first visible feature group for this page
                    const pageGroup = groupResult.data.find((pg: any) => pg.isVisible && pg.featureGroup.isActive);
                    if (pageGroup) {
                      featuresData = pageGroup.featureGroup.groupItems
                        .filter((item: any) => item.isVisible)
                        .map((item: any) => item.feature)
                        .sort((a: GlobalFeature, b: GlobalFeature) => a.sortOrder - b.sortOrder);
                      heading = pageGroup.featureGroup.heading;
                      subheading = pageGroup.featureGroup.subheading || '';
                    }
                  }
                }
              }
            }
          }
        }

        // Priority 3: Default fallback - fetch all visible features
        if (featuresData.length === 0) {
          const response = await fetch('/api/admin/features');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              featuresData = result.data
                .filter((feature: GlobalFeature) => feature.isVisible)
                .sort((a: GlobalFeature, b: GlobalFeature) => a.sortOrder - b.sortOrder);
            }
          }
        }

        // Final fallback if all API calls fail
        if (featuresData.length === 0) {
          featuresData = defaultFeatures;
        }

        setFeatures(featuresData);
        setGroupHeading(propHeading || heading);
        setGroupSubheading(propSubheading || subheading);

      } catch (error) {
        console.error('Error fetching features:', error);
        // Fall back to default features if everything fails
        setFeatures(defaultFeatures);
        setGroupHeading(propHeading || 'Why Saski AI?');
        setGroupSubheading(propSubheading || 'Simple. Smart. Built for growing businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [propFeatures, featureGroupId, pageSlug, propHeading, propSubheading, defaultFeatures]);

  const getIconComponent = (iconName: string) => {
    const iconProps = { size: 40, strokeWidth: 2.5 };
    
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Smile,
      Users,
      MessageSquare,
      Settings,
      Languages,
      BookOpen,
      Zap,
      Shield,
      Clock,
      Globe,
      Code,
      Award,
      TrendingUp,
      Heart,
      Sparkles,
      Play,
      ArrowRight,
      Download,
      ExternalLink,
      Mail,
      Phone,
      Video,
      Calendar,
      Gift,
      Rocket
    };

    const IconComponent = iconMap[iconName] || Smile;
    return <IconComponent {...iconProps} />;
  };

  // Show loading state
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100">
        <div className="elementor-container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no features
  if (features.length === 0) {
    return null;
  }

  const displayFeatures = features.slice(0, 6); // Show max 6 features

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100">
      {/* Elementor Container */}
      <div className="elementor-container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="elementor-column elementor-col-100">
          <div className="elementor-widget-wrap">
            
            {/* Header Section */}
            <div className="elementor-widget elementor-widget-heading text-center mb-4">
              <div className="elementor-widget-container">
                <motion.h4 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide mb-4"
                >
                  Core Features
                </motion.h4>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="elementor-heading-title text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                >
                  {groupHeading || 'Why Saski AI?'}
                </motion.h2>
              </div>
            </div>

            {/* Subtitle Section */}
            <div className="elementor-widget elementor-widget-text-editor text-center mb-16">
              <div className="elementor-widget-container">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-lg text-gray-600 leading-relaxed"
                >
                  <span>{groupSubheading || 'Simple. Smart. Built for growing businesses'}</span>
                </motion.p>
              </div>
            </div>

            {/* First Row - 3 Columns */}
            <section className="elementor-inner-section mb-12">
              <div className="elementor-container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {displayFeatures.slice(0, 3).map((feature, index) => (
                    <div key={feature.id} className="elementor-column elementor-col-33">
                      <div className="elementor-widget-wrap">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="group bg-white rounded-xl px-16 py-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="elementor-icon-box-wrapper">
                            {/* Icon */}
                            <div className="elementor-icon-box-icon mb-3 flex justify-start">
                              <span className="elementor-icon">
                                <div className="w-12 h-12 flex items-center justify-center">
                                  <div style={{ color: 'var(--color-primary)' }}>
                                    {getIconComponent(feature.iconName)}
                                  </div>
                                </div>
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="elementor-icon-box-content">
                              <h3 className="elementor-icon-box-title text-xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                                <span>
                                  {feature.title}
                                </span>
                              </h3>
                              
                              <p className="elementor-icon-box-description text-gray-700 leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Second Row - 3 Columns (if we have more than 3 features) */}
            {displayFeatures.length > 3 && (
              <section className="elementor-inner-section">
                <div className="elementor-container">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayFeatures.slice(3, 6).map((feature, index) => (
                      <div key={feature.id} className="elementor-column elementor-col-33">
                        <div className="elementor-widget-wrap">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: (index + 3) * 0.1 }}
                            className="group bg-white rounded-xl px-16 py-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                          >
                            <div className="elementor-icon-box-wrapper">
                              {/* Icon */}
                              <div className="elementor-icon-box-icon mb-3 flex justify-start">
                                <span className="elementor-icon">
                                  <div className="w-12 h-12 flex items-center justify-center">
                                    <div style={{ color: 'var(--color-primary)' }}>
                                      {getIconComponent(feature.iconName)}
                                    </div>
                                  </div>
                                </span>
                              </div>
                              
                              {/* Content */}
                              <div className="elementor-icon-box-content">
                                <h3 className="elementor-icon-box-title text-xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                                  <span>
                                    {feature.title}
                                  </span>
                                </h3>
                                
                                <p className="elementor-icon-box-description text-gray-700 leading-relaxed">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 
