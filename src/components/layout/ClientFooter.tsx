'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github, 
  Youtube,
  ArrowRight,
  Heart,
  Facebook,
  Instagram,
  Send
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

// Custom CSS for animations
const customStyles = `
  @keyframes tilt {
    0%, 50%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(1deg);
    }
    75% {
      transform: rotate(-1deg);
    }
  }
  
  .animate-tilt {
    animation: tilt 10s infinite linear;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}

interface Page {
  id: number;
  slug: string;
  title: string;
  showInFooter: boolean;
  sortOrder: number;
}

interface SiteSettings {
  id: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  companyAddress: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  footerNewsletterFormId: number | null;
  footerCopyrightMessage: string | null;
  footerMenuIds: string | null;
  footerShowContactInfo: boolean;
  footerShowSocialLinks: boolean;
  footerCompanyName: string | null;
  footerCompanyDescription: string | null;
  footerBackgroundColor: string | null;
  footerTextColor: string | null;
}

interface Menu {
  id: number;
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  id: number;
  label: string;
  url: string;
  linkType?: string;
  target: string;
}

interface Form {
  id: number;
  name: string;
  title: string;
  subheading?: string;
  fields: any[];
}

interface ClientFooterProps {
  pages: Page[];
}

// Utility function to determine if a color is light or dark
const isLightColor = (hexColor: string): boolean => {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
};

const ClientFooter: React.FC<ClientFooterProps> = ({ pages }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [footerMenus, setFooterMenus] = useState<Menu[]>([]);
  const [newsletterForm, setNewsletterForm] = useState<Form | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const settings = await response.json();
        setSiteSettings(settings);
        
        // Fetch footer menus if configured
        if (settings.footerMenuIds) {
          try {
            const menuIds = JSON.parse(settings.footerMenuIds);
            console.log('Parsed footer menu IDs:', menuIds);
            if (menuIds.length > 0) {
              fetchFooterMenus(menuIds);
            }
          } catch (error) {
            console.error('Error parsing footer menu IDs:', error);
          }
        }

        // Fetch newsletter form if configured
        if (settings.footerNewsletterFormId) {
          fetchNewsletterForm(settings.footerNewsletterFormId);
        }
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchFooterMenus = async (menuIds: number[]) => {
    try {
      console.log('Fetching footer menus for IDs:', menuIds);
      const response = await fetch('/api/admin/menus');
      if (response.ok) {
        const result = await response.json();
        console.log('Menu API response:', result);
        
        // Handle the API response structure with success and data fields
        const allMenus = result.success ? result.data : result;
        console.log('All menus:', allMenus);
        console.log('All menu IDs:', allMenus.map((m: any) => m.id));
        
        const selectedMenus = allMenus.filter((menu: Menu) => menuIds.includes(menu.id));
        console.log('Selected menus:', selectedMenus);
        
        setFooterMenus(selectedMenus);
        console.log('Footer menus set to state:', selectedMenus);
      } else {
        console.error('Failed to fetch menus, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching footer menus:', error);
    }
  };

  const fetchNewsletterForm = async (formId: number) => {
    try {
      console.log('Fetching newsletter form for ID:', formId);
      const response = await fetch('/api/admin/forms');
      if (response.ok) {
        const result = await response.json();
        console.log('Forms API response:', result);
        
        // Handle the API response structure with success and data fields
        const allForms = result.success ? result.data : result;
        console.log('All forms:', allForms);
        
        const form = allForms.find((f: Form) => f.id === formId);
        console.log('Found newsletter form:', form);
        
        if (form) {
          setNewsletterForm(form);
          console.log('Newsletter form set to state:', form);
        } else {
          console.warn('Newsletter form not found for ID:', formId);
        }
      } else {
        console.error('Failed to fetch forms, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching newsletter form:', error);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterForm || !newsletterEmail) return;

    setNewsletterLoading(true);
    setNewsletterMessage(null);

    try {
      const formData = { email: newsletterEmail };
      const metadata = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ipAddress: null
      };

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: newsletterForm.id,
          formData,
          metadata
        }),
      });

      if (response.ok) {
        setNewsletterMessage({ type: 'success', text: 'Thank you for subscribing!' });
        setNewsletterEmail('');
      } else {
        const error = await response.json();
        setNewsletterMessage({ type: 'error', text: error.error || 'Subscription failed. Please try again.' });
      }
    } catch (error) {
      setNewsletterMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!siteSettings) {
    return null; // Loading state
  }

  const currentYear = new Date().getFullYear();
  const copyrightMessage = siteSettings.footerCopyrightMessage
    ? siteSettings.footerCopyrightMessage.replace('{year}', currentYear.toString())
    : `© ${currentYear} ${siteSettings.footerCompanyName || 'Your Company'}. All rights reserved.`;

  // Determine which logo to use based on background color
  const footerBgColor = siteSettings.footerBackgroundColor || '#F9FAFB';
  const footerTextColor = siteSettings.footerTextColor || '#374151';
  const shouldUseLightLogo = !isLightColor(footerBgColor); // Use light logo on dark backgrounds
  
  // Smart logo selection with proper fallbacks
  let logoUrl: string | null = null;
  
  if (shouldUseLightLogo) {
    // For dark backgrounds, use light logo
    logoUrl = siteSettings.logoLightUrl || siteSettings.logoUrl;
  } else {
    // For light backgrounds, use dark logo
    logoUrl = siteSettings.logoDarkUrl || siteSettings.logoUrl;
  }
  
  // Additional fallback: if no logo is available, use the primary logoUrl
  if (!logoUrl) {
    logoUrl = siteSettings.logoUrl;
  }
  
  // Debug logging to help identify logo issues
  console.log('Footer logo selection:', {
    footerBgColor,
    shouldUseLightLogo,
    logoUrl,
    logoLightUrl: siteSettings.logoLightUrl,
    logoDarkUrl: siteSettings.logoDarkUrl,
    primaryLogoUrl: siteSettings.logoUrl
  });

  // Dynamic text colors based on footer text color setting
  const textColorClass = footerTextColor;
  const lightTextColor = footerTextColor; // Use the actual footer text color for all text
  const hoverTextColor = isLightColor(footerTextColor) 
    ? '#FFFFFF'  // If text is light, hover to pure white
    : '#000000'; // If text is dark, hover to pure black

  const socialLinks = [
    { name: 'Facebook', url: siteSettings.socialFacebook, icon: Facebook, color: 'hover:text-blue-600' },
    { name: 'Twitter', url: siteSettings.socialTwitter, icon: Twitter, color: 'hover:text-blue-400' },
    { name: 'LinkedIn', url: siteSettings.socialLinkedin, icon: Linkedin, color: 'hover:text-blue-700' },
    { name: 'Instagram', url: siteSettings.socialInstagram, icon: Instagram, color: 'hover:text-pink-600' },
    { name: 'YouTube', url: siteSettings.socialYoutube, icon: Youtube, color: 'hover:text-red-600' },
  ].filter(link => link.url);

  // Debug footer menus and newsletter form
  console.log('Footer menus state:', footerMenus);
  console.log('Footer menus count:', footerMenus.length);
  console.log('Site settings footer menu IDs:', siteSettings.footerMenuIds);
  console.log('Newsletter form state:', newsletterForm);
  console.log('Newsletter form ID from settings:', siteSettings.footerNewsletterFormId);

  // Temporary test data if no menus loaded
  const testMenus = footerMenus.length === 0 ? [
    {
      id: 999,
      name: 'Test Menu',
      items: [
        { id: 1, label: 'Test Link 1', url: '/test1', target: '_self' },
        { id: 2, label: 'Test Link 2', url: '/test2', target: '_self' },
      ]
    }
  ] : footerMenus;

  return (
    <>
      {/* Main Footer */}
      <footer 
        className="border-t border-gray-200 dark:border-gray-700"
        style={{ backgroundColor: footerBgColor }}
      >
        {/* Newsletter Section - Embedded within Footer */}
        {newsletterForm && (
          <div className="border-b" style={{ borderColor: isLightColor(footerBgColor) ? '#E2E8F0' : '#334155' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-0 items-start">
                {/* Logo and Contact Info */}
                <div className="space-y-4 lg:pr-6">
                  {/* Logo */}
                  <div className="flex items-center space-x-2">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-10 w-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div 
                        className="text-lg font-bold"
                        style={{ color: textColorClass }}
                      >
                        {siteSettings.footerCompanyName || 'Your Company'}
                      </div>
                    )}
                  </div>
                  
                  {/* Company Description */}
                  {siteSettings.footerCompanyDescription && (
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: lightTextColor }}
                    >
                      {siteSettings.footerCompanyDescription}
                    </p>
                  )}

                  {/* Contact Information */}
                  {siteSettings.footerShowContactInfo && (
                    <div className="space-y-2">
                      {siteSettings.companyEmail && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3" style={{ color: lightTextColor }} />
                          <a 
                            href={`mailto:${siteSettings.companyEmail}`}
                            className="text-xs transition-colors hover:opacity-80"
                            style={{ color: lightTextColor }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = hoverTextColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = lightTextColor;
                            }}
                          >
                            {siteSettings.companyEmail}
                          </a>
                        </div>
                      )}
                      {siteSettings.companyPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3" style={{ color: lightTextColor }} />
                          <a 
                            href={`tel:${siteSettings.companyPhone}`}
                            className="text-xs transition-colors hover:opacity-80"
                            style={{ color: lightTextColor }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = hoverTextColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = lightTextColor;
                            }}
                          >
                            {siteSettings.companyPhone}
                          </a>
                        </div>
                      )}
                      {siteSettings.companyAddress && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3 h-3 mt-0.5" style={{ color: lightTextColor }} />
                          <p 
                            className="text-xs"
                            style={{ color: lightTextColor }}
                          >
                            {siteSettings.companyAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Menus with Elegant Dividers */}
                {testMenus.length > 0 && testMenus.slice(0, 2).map((menu, index) => (
                  <div 
                    key={menu.id} 
                    className="lg:px-6 lg:border-l py-4 lg:py-0"
                    style={{ 
                      borderColor: isLightColor(footerBgColor) ? '#E2E8F0' : '#334155'
                    }}
                  >
                    <h4 
                      className="text-sm font-semibold mb-3"
                      style={{ color: textColorClass }}
                    >
                      {menu.name}
                    </h4>
                    <ul className="space-y-1">
                      {menu.items.slice(0, 5).map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.url}
                            target={item.target}
                            className="text-xs transition-colors hover:opacity-80"
                            style={{ 
                              color: lightTextColor,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = hoverTextColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = lightTextColor;
                            }}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Newsletter Form */}
                <div 
                  className="lg:col-span-2 lg:pl-6 lg:border-l"
                  style={{
                    borderColor: isLightColor(footerBgColor) ? '#E2E8F0' : '#334155'
                  }}
                >
                  <form onSubmit={handleNewsletterSubmit}>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        placeholder={
                          newsletterForm.fields?.find((field: any) => 
                            field.fieldType === 'email' || field.fieldName?.toLowerCase().includes('email')
                          )?.placeholder || 'Enter your email'
                        }
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                        className="flex-1 px-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        style={{
                          borderColor: isLightColor(footerBgColor) ? '#D1D5DB' : '#4B5563',
                          backgroundColor: isLightColor(footerBgColor) ? '#FFFFFF' : '#374151',
                          color: isLightColor(footerBgColor) ? '#1F2937' : '#F9FAFB'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={newsletterLoading}
                        className="px-6 py-3 text-white font-medium text-sm rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap"
                        style={{
                          backgroundColor: 'var(--color-primary, #3B82F6)'
                        }}
                      >
                        {newsletterLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Subscribe</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                    
                    {newsletterMessage && (
                      <div className={`mt-3 p-2 rounded-lg text-xs flex items-center space-x-2 ${
                        newsletterMessage.type === 'success' 
                          ? 'bg-green-50 border border-green-200 text-green-800' 
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}>
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${
                          newsletterMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 bg-white rounded-full ${
                            newsletterMessage.type === 'error' ? 'h-0.5' : ''
                          }`}></div>
                        </div>
                        <span>{newsletterMessage.text}</span>
                      </div>
                    )}
                  </form>
                  
                  <p 
                    className="text-sm mt-3"
                    style={{ color: lightTextColor }}
                  >
                    {newsletterForm.subheading || 'Subscribe to our newsletter and get the latest updates delivered to your inbox.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Content - Simplified without duplicates */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p 
              className="text-sm"
              style={{ color: lightTextColor }}
            >
              {copyrightMessage}
            </p>
            
            {/* Social Links */}
            {siteSettings.footerShowSocialLinks && socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                      style={{ 
                        backgroundColor: `${textColorClass}20`,
                        color: lightTextColor 
                      }}
                      whileHover={{ 
                        backgroundColor: `${textColorClass}30`,
                        scale: 1.1 
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};

export default ClientFooter; 
