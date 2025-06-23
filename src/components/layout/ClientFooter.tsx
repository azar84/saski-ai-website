'use client';

import React from 'react';
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
  Heart
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface Page {
  id: number;
  slug: string;
  title: string;
  showInFooter: boolean;
  sortOrder: number;
}

interface ClientFooterProps {
  pages: Page[];
}

const ClientFooter: React.FC<ClientFooterProps> = ({ pages }) => {
  // Static footer sections (keeping the existing structure)
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Integrations', href: '/integrations' },
        { name: 'API Documentation', href: '/docs' },
        { name: 'Changelog', href: '/changelog' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press Kit', href: '/press' },
        { name: 'Contact', href: '/contact' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Community', href: '/community' },
        { name: 'Tutorials', href: '/tutorials' },
        { name: 'Case Studies', href: '/case-studies' },
        { name: 'Webinars', href: '/webinars' }
      ]
    },
    // Dynamic Pages Section - only show if there are pages to display
    ...(pages.length > 0 ? [{
      title: 'Pages',
      links: pages
        .filter(page => page.sortOrder > 0) // Only show pages with sortOrder > 0
        .map(page => ({
          name: page.title,
          href: `/${page.slug}`
        }))
    }] : []),
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR', href: '/gdpr' },
        { name: 'Security', href: '/security' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com/saskiai' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, href: 'https://linkedin.com/company/saskiai' },
    { name: 'Github', icon: <Github className="w-5 h-5" />, href: 'https://github.com/saskiai' },
    { name: 'YouTube', icon: <Youtube className="w-5 h-5" />, href: 'https://youtube.com/saskiai' }
  ];

  return (
    <footer className="bg-[#0F1A2A] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#5243E9]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="border-b border-[#27364B] py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  Stay Updated with <span className="gradient-text">Saski AI</span>
                </h3>
                <p className="text-[#94A3B8] text-lg">
                  Get the latest updates on new features, integrations, and AI innovations 
                  delivered straight to your inbox.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  className="flex-1 bg-[#1E2A3B] border-[#27364B] text-white"
                />
                <Button 
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <Link href="/" className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#5243E9] to-[#7C3AED] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-2xl font-bold text-white">
                      Saski AI
                    </span>
                  </Link>
                  
                  <p className="text-[#94A3B8] mb-6">
                    Transform your customer communication with AI-powered automation 
                    across multiple channels.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[#94A3B8]">
                      <Mail className="w-4 h-4 text-[#5243E9]" />
                      <span className="text-sm">hello@saskiai.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#94A3B8]">
                      <Phone className="w-4 h-4 text-[#5243E9]" />
                      <span className="text-sm">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#94A3B8]">
                      <MapPin className="w-4 h-4 text-[#5243E9]" />
                      <span className="text-sm">San Francisco, CA</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Links Sections */}
              {footerSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-semibold text-white mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-[#94A3B8] hover:text-white transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#27364B] py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                <span>© 2024 Saski AI. Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>in San Francisco.</span>
              </div>

              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-[#1E2A3B] hover:bg-[#5243E9] rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white transition-all duration-200"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter; 