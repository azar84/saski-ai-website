'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
// Import the icon library for getIconComponent
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  isActive: boolean;
}

interface SiteSettings {
  id: number;
  logoUrl: string | null;
  faviconUrl: string | null;
}

interface CTAButton {
  text: string;
  url: string;
  icon?: string; // Optional Lucide icon name
  style: string;
  target: string;
}

interface ClientHeaderProps {
  navigationItems: NavigationItem[];
  ctaButtons?: CTAButton[];
  siteSettings: SiteSettings | null;
}

export default function ClientHeader({ navigationItems, ctaButtons = [], siteSettings }: ClientHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Debug info only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('ClientHeader - Navigation items received:', navigationItems);
    console.log('ClientHeader - CTA buttons received:', ctaButtons);
  }

  // Function to get icon component from icon name
  const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        // Subtle floating animation
        ...(isScrolled ? {} : {
          y: [0, -2, 0],
          transition: {
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        })
      }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100/50 transform-gpu' 
          : 'bg-white/90 backdrop-blur-lg shadow-sm transform-gpu'
      )}
    >
      {/* Animated background gradient */}
      <div className={cn(
        'absolute inset-0 transition-opacity duration-500',
        isScrolled 
          ? 'opacity-0' 
          : 'opacity-100 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-indigo-50/30'
      )} />
      
      {/* Subtle border animation */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#5243E9] via-[#7C3AED] to-[#5243E9]"
        initial={{ width: 0 }}
        animate={{ width: isScrolled ? '100%' : '0%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <nav className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              <Link href="/" className="flex items-center flex-shrink-0 group">
                {siteSettings?.logoUrl ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Image
                      src={siteSettings.logoUrl}
                      alt="Saski AI"
                      width={200}
                      height={60}
                      className="h-10 lg:h-12 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
                      priority
                    />
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#5243E9] via-[#7C3AED] to-[#8B5CF6] animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Sparkle effects */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                        <div className="absolute top-2 right-1 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
                      </div>
                      
                      <span className="relative text-white font-bold text-lg lg:text-xl z-10">S</span>
                    </motion.div>
                    <motion.span 
                      className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-[#5243E9] group-hover:via-[#7C3AED] group-hover:to-[#5243E9] transition-all duration-500"
                      whileHover={{ scale: 1.02 }}
                    >
                      Saski AI
                    </motion.span>
                  </div>
                )}
              </Link>
            </motion.div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex flex-1 justify-center relative z-10">
              <nav className="flex items-center space-x-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    className="relative group"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'relative px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden',
                        'text-gray-700 hover:text-[var(--color-primary)] hover:scale-105',
                        item.isActive && 'text-[var(--color-primary)]'
                      )}
                    >
                      {/* Hover background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/0 via-[var(--color-primary)]/5 to-[#7C3AED]/0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      {/* Active state background */}
                      {item.isActive && (
                        <motion.div
                          layoutId="activeNavTab"
                          className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 via-[#7C3AED]/10 to-[var(--color-primary)]/10 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      {/* Hover underline effect */}
                      <motion.div
                        className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[#7C3AED] rounded-full"
                        initial={{ width: 0, x: '-50%' }}
                        whileHover={{ width: '80%' }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Right Side Buttons */}
            <motion.div 
              className="hidden lg:flex items-center space-x-4 flex-shrink-0 relative z-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {ctaButtons.map((cta, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={cta.url}
                    target={cta.target}
                    className={cn(
                      'relative px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 overflow-hidden group inline-flex items-center justify-center',
                      cta.style === 'primary' 
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[#7C3AED] text-white shadow-lg hover:shadow-xl hover:shadow-[var(--color-primary)]/25'
                        : cta.style === 'secondary'
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg'
                        : cta.style === 'outline'
                        ? 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:text-white shadow-md hover:shadow-lg hover:shadow-[var(--color-primary)]/20'
                        : cta.style === 'ghost'
                        ? 'text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-50 border border-gray-200 hover:border-[var(--color-primary)]/30'
                        : 'text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-50'
                    )}
                  >
                    {/* Primary button special effects */}
                    {cta.style === 'primary' && (
                      <>
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[#7C3AED] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                      </>
                    )}
                    
                    {/* Outline button fill effect */}
                    {cta.style === 'outline' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[#7C3AED] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    )}
                    
                    <span className="relative z-10 flex items-center space-x-1.5">
                      {cta.icon && (() => {
                        const IconComponent = getIconComponent(cta.icon);
                        return IconComponent ? (
                          <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: -1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <IconComponent className="w-4 h-4" />
                          </motion.div>
                        ) : null;
                      })()}
                      <span>{cta.text}</span>
                      {cta.style === 'primary' && !cta.icon && (
                        <motion.svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          initial={{ x: 0 }}
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </motion.svg>
                      )}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="lg:hidden relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-[var(--color-primary)]/5 hover:to-[#7C3AED]/5 transition-all duration-300 group"
              type="button"
              onClick={toggleMenu}
              aria-controls="navbarSupportedContent"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-[#7C3AED]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative z-10"
              >
                {isMenuOpen ? (
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-[var(--color-primary)] group-hover:text-[#7C3AED] transition-colors duration-300" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-gray-700 group-hover:text-[var(--color-primary)] transition-colors duration-300" />
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:hidden border-t border-gray-100 bg-gradient-to-br from-white via-gray-50/50 to-white shadow-2xl backdrop-blur-xl"
            id="navbarSupportedContent"
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/5 via-transparent to-[#7C3AED]/5 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
              <nav className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 + 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="group"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'relative block px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 overflow-hidden',
                        'text-gray-700 hover:text-[var(--color-primary)] hover:scale-[1.02] hover:shadow-lg',
                        item.isActive && 'text-[var(--color-primary)] shadow-md'
                      )}
                    >
                      {/* Background gradient effect */}
                      <div className={cn(
                        'absolute inset-0 transition-all duration-300',
                        item.isActive 
                          ? 'bg-gradient-to-r from-[var(--color-primary)]/10 via-[#7C3AED]/10 to-[var(--color-primary)]/10'
                          : 'bg-gradient-to-r from-[var(--color-primary)]/0 via-[var(--color-primary)]/5 to-[#7C3AED]/0 opacity-0 group-hover:opacity-100'
                      )} />
                      
                      {/* Animated underline */}
                      <motion.div
                        className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[#7C3AED] rounded-full"
                        initial={{ scaleX: item.isActive ? 1 : 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <span className="relative z-10 flex items-center justify-between">
                        {item.name}
                        <motion.svg
                          className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </span>
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile CTA Buttons */}
                {ctaButtons.length > 0 && (
                  <motion.div 
                    className="pt-8 mt-6 border-t border-gradient-to-r from-gray-200 via-gray-100 to-gray-200 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: navigationItems.length * 0.1 + 0.3 }}
                  >
                    {ctaButtons.map((cta, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: navigationItems.length * 0.1 + 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={cta.url}
                          target={cta.target}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            'relative flex items-center justify-center px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 overflow-hidden group shadow-lg hover:shadow-xl',
                            cta.style === 'primary' 
                              ? 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:text-white shadow-md hover:shadow-lg hover:shadow-[var(--color-primary)]/20'
                              : 'text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-50 shadow-sm'
                          )}
                        >
                          {/* Primary button effects */}
                          {cta.style === 'primary' && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-r from-[#5243E9] to-[#7C3AED] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                            </>
                          )}
                          
                          {/* Outline button fill effect */}
                          {cta.style === 'outline' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[#7C3AED] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                          )}
                          
                          <span className="relative z-10 flex items-center justify-center space-x-2">
                            {cta.icon && (() => {
                              const IconComponent = getIconComponent(cta.icon);
                              return IconComponent ? (
                                <motion.div
                                  initial={{ x: 0 }}
                                  whileHover={{ x: -2 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <IconComponent className="w-5 h-5" />
                                </motion.div>
                              ) : null;
                            })()}
                            <span>{cta.text}</span>
                            {cta.style === 'primary' && !cta.icon && (
                              <motion.svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                initial={{ x: 0 }}
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </motion.svg>
                            )}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
} 
