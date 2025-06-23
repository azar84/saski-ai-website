'use client';

import React from 'react';
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
  Clock
} from 'lucide-react';
import { Feature } from '@/types';

interface FeaturesSectionProps {
  features?: Feature[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features = [] }) => {
  // Default features matching the cleaner design
  const defaultFeatures: Feature[] = [
    {
      id: 1,
      attributes: {
        title: 'Easy to Use',
        description: 'Get started in minutes with a setup anyone can follow, no tech skills needed.',
        iconName: 'Smile',
        category: 'core',
        isHighlighted: true,
        order: 1,
        createdAt: '',
        updatedAt: ''
      }
    },
    {
      id: 2,
      attributes: {
        title: 'Automated Support',
        description: 'Answer questions, schedule meetings, and create tickets automatically.',
        iconName: 'Users',
        category: 'automation',
        isHighlighted: true,
        order: 2,
        createdAt: '',
        updatedAt: ''
      }
    },
    {
      id: 3,
      attributes: {
        title: 'Multi-Channel Messaging',
        description: 'Talk to customers on WhatsApp, SMS, voice, web, and Facebook seamlessly.',
        iconName: 'MessageSquare',
        category: 'communication',
        isHighlighted: true,
        order: 3,
        createdAt: '',
        updatedAt: ''
      }
    },
    {
      id: 4,
      attributes: {
        title: 'Tool Integrations',
        description: 'Connect with your CRM, calendar, or helpdesk in just a few clicks.',
        iconName: 'Settings',
        category: 'integration',
        isHighlighted: true,
        order: 4,
        createdAt: '',
        updatedAt: ''
      }
    },
    {
      id: 5,
      attributes: {
        title: 'Multilingual by Default',
        description: 'Support customers in 12+ languages, out of the box.',
        iconName: 'Languages',
        category: 'communication',
        isHighlighted: true,
        order: 5,
        createdAt: '',
        updatedAt: ''
      }
    },
    {
      id: 6,
      attributes: {
        title: 'Smart Knowledge Base',
        description: 'Use your website, files, or copied text to teach your assistant instantly.',
        iconName: 'BookOpen',
        category: 'core',
        isHighlighted: true,
        order: 6,
        createdAt: '',
        updatedAt: ''
      }
    }
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  const getIconComponent = (iconName: string) => {
    const iconProps = { size: 40, strokeWidth: 2.5 };
    
    switch (iconName) {
      case 'Smile': return <Smile {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'MessageSquare': return <MessageSquare {...iconProps} />;
      case 'Settings': return <Settings {...iconProps} />;
      case 'Languages': return <Languages {...iconProps} />;
      case 'BookOpen': return <BookOpen {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Clock': return <Clock {...iconProps} />;
      default: return <Smile {...iconProps} />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#5243E9]/8 via-[#6366F1]/6 to-[#8B5CF6]/8">
      {/* Elementor Container */}
      <div className="elementor-container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="elementor-column elementor-col-100">
          <div className="elementor-widget-wrap">
            
            {/* Header Section */}
            <div className="elementor-widget elementor-widget-heading text-center mb-4">
              <div className="elementor-widget-container">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="elementor-heading-title text-3xl sm:text-4xl font-bold text-gray-900"
                >
                  Why Saski AI?
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
                  className="text-lg text-gray-600"
                >
                  <span>Simple. Smart. Built for growing businesses</span>
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
                                  <div style={{ color: '#5243E9' }}>
                                    {getIconComponent(feature.attributes.iconName || 'Smile')}
                                  </div>
                                </div>
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="elementor-icon-box-content">
                              <h3 className="elementor-icon-box-title text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5243E9] transition-colors duration-300">
                                <span>
                                  {feature.attributes.title}
                                </span>
                              </h3>
                              
                              <p className="elementor-icon-box-description text-gray-700 leading-relaxed">
                                {feature.attributes.description}
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

            {/* Second Row - 3 Columns */}
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
                                  <div style={{ color: '#5243E9' }}>
                                    {getIconComponent(feature.attributes.iconName || 'Smile')}
                                  </div>
                                </div>
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="elementor-icon-box-content">
                              <h3 className="elementor-icon-box-title text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5243E9] transition-colors duration-300">
                                <span>
                                  {feature.attributes.title}
                                </span>
                              </h3>
                              
                              <p className="elementor-icon-box-description text-gray-700 leading-relaxed">
                                {feature.attributes.description}
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

          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 