'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, UserPlus, LogIn, Star, ArrowRight } from 'lucide-react';
// Import the icon library for getIconComponent
import * as LucideIcons from 'lucide-react';
import { cn, getAppropriateLogoUrl } from '@/lib/utils';
import { useDesignSystem } from '@/hooks/useDesignSystem';

// Utility function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
};

// Get automatic text color based on background
const getAutoTextColor = (backgroundColor: string): string => {
  return isLightColor(backgroundColor) ? '#1F2937' : '#FFFFFF';
};

// Get automatic hover color based on background
const getAutoHoverColor = (backgroundColor: string): string => {
  return isLightColor(backgroundColor) ? '#3B82F6' : '#60A5FA';
};

interface NavigationItem {
  name: string;
  href: string;
  isActive: boolean;
  children?: NavigationItem[];
}

interface SiteSettings {
  id: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
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
  backgroundColor?: string;
  menuTextColor?: string;
  menuHoverColor?: string;
  menuActiveColor?: string;
}

export default function ClientHeader({ 
  navigationItems, 
  ctaButtons = [], 
  siteSettings, 
  backgroundColor = '#ffffff',
  menuTextColor = '#374151',
  menuHoverColor = '#5243E9',
  menuActiveColor = '#5243E9'
}: ClientHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<Set<string>>(new Set());
  const { designSystem } = useDesignSystem();

  // Auto-detect colors if defaults are being used
  const autoTextColor = getAutoTextColor(backgroundColor);
  const autoHoverColor = getAutoHoverColor(backgroundColor);
  
  // Use custom colors if they're different from defaults, otherwise use auto-detected colors
  const finalMenuTextColor = menuTextColor !== '#374151' ? menuTextColor : autoTextColor;
  const finalMenuHoverColor = menuHoverColor !== '#5243E9' ? menuHoverColor : autoHoverColor;
  const finalMenuActiveColor = menuActiveColor !== '#5243E9' ? menuActiveColor : autoHoverColor;

  // Debug info only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('ClientHeader - Navigation items received:', navigationItems);
    console.log('ClientHeader - CTA buttons received:', ctaButtons);
    console.log('ClientHeader - Site settings received:', siteSettings);
    console.log('ClientHeader - Background color:', backgroundColor);
    
    if (siteSettings) {
      const logoUrl = getAppropriateLogoUrl(siteSettings, backgroundColor);
      console.log('ClientHeader - Logo selection debug:', {
        backgroundColor,
        isBackgroundDark: isLightColor(backgroundColor) ? 'No (light)' : 'Yes (dark)',
        logoUrl: siteSettings.logoUrl,
        logoLightUrl: siteSettings.logoLightUrl,
        logoDarkUrl: siteSettings.logoDarkUrl,
        selectedLogoUrl: logoUrl
      });
    }
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
  
  const toggleMobileSubmenu = (itemName: string) => {
    setExpandedMobileItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

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
          ? 'backdrop-blur-xl shadow-xl border-b border-gray-100/50' 
          : 'backdrop-blur-lg'
      )}
      style={{
        backgroundColor: backgroundColor // Consistent color regardless of scroll state
      }}
    >
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
                {(() => {
                  const logoUrl = getAppropriateLogoUrl(siteSettings || {}, backgroundColor);
                  return logoUrl ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Image
                        src={logoUrl}
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
                        
                        {/* Icon */}
                        <span className="relative text-white font-bold text-lg lg:text-xl z-10">
                          S
                        </span>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                      <motion.span 
                        className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#5243E9] to-[#7C3AED] bg-clip-text text-transparent group-hover:from-[#4338CA] group-hover:to-[#6D28D9] transition-all duration-300"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        Saski AI
                      </motion.span>
                    </div>
                  );
                })()}
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
                    {item.children && item.children.length > 0 ? (
                      // Dropdown menu item with children
                      <div className="relative group">
                        <Link
                          href={item.href}
                          className="relative px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden hover:scale-105 flex items-center space-x-1.5"
                          style={{
                            color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                          }}
                          onMouseEnter={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                            }
                          }}
                        >
                          {/* Elegant hover background effect */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                            style={{
                              background: `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`
                            }}
                          />
                          
                          {/* Active state background with subtle animation */}
                          {item.isActive && (
                            <motion.div
                              layoutId="activeNavTab"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                              }}
                              initial={false}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          
                          {/* Sophisticated hover underline effect */}
                          <motion.div
                            className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                            }}
                            initial={{ width: 0, x: '-50%' }}
                            whileHover={{ width: '85%' }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          />
                          
                          <span className="relative z-10 font-medium">{item.name}</span>
                          
                          {/* Sophisticated dropdown arrow with smooth rotation - only show if has children */}
                          {item.children && item.children.length > 0 && (
                            <motion.div
                              className="relative z-10"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.svg
                                className="w-4 h-4 transition-all duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                animate={{ rotate: 0 }}
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </motion.div>
                          )}
                        </Link>
                        
                        {/* Simple Dropdown Menu - Child Items Only */}
                        <motion.div
                          className="absolute top-full left-0 mt-1 min-w-48 rounded-xl shadow-xl border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50"
                          style={{
                            backgroundColor: designSystem?.backgroundPrimary || '#ffffff',
                            borderColor: designSystem?.grayLight || '#e5e7eb'
                          }}
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                          {/* Child Items Only */}
                          <div className="py-1">
                            {item.children?.map((child, childIndex) => (
                              <motion.div
                                key={child.href}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ 
                                  duration: 0.1, 
                                  delay: childIndex * 0.02,
                                  ease: "easeOut"
                                }}
                              >
                                <Link
                                  href={child.href}
                                  className="flex items-center px-4 py-2.5 text-sm transition-all duration-150 group/child"
                                  style={{
                                    color: child.isActive 
                                      ? designSystem?.primaryColor || finalMenuActiveColor
                                      : designSystem?.textSecondary || '#6b7280'
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = designSystem?.backgroundSecondary || '#f8fafc';
                                    if (!child.isActive) {
                                      (e.target as HTMLElement).style.color = designSystem?.textPrimary || '#1f2937';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                    if (!child.isActive) {
                                      (e.target as HTMLElement).style.color = designSystem?.textSecondary || '#6b7280';
                                    }
                                  }}
                                >
                                  <span className="group-hover/child:font-medium transition-all duration-150">
                                    {child.name}
                                  </span>
                                  {child.isActive && (
                                    <div 
                                      className="ml-auto w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: designSystem?.primaryColor || finalMenuActiveColor }}
                                    ></div>
                                  )}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      // Regular menu item (no children)
                      <Link
                        href={item.href}
                        className="relative px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden hover:scale-105"
                        style={{
                          color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                        }}
                        onMouseEnter={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                          }
                        }}
                      >
                        {/* Elegant hover background effect */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`
                          }}
                        />
                        
                        {/* Active state background with subtle animation */}
                        {item.isActive && (
                          <motion.div
                            layoutId="activeNavTab"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                            }}
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        
                        {/* Sophisticated hover underline effect */}
                        <motion.div
                          className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                          }}
                          initial={{ width: 0, x: '-50%' }}
                          whileHover={{ width: '85%' }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        
                        <span className="relative z-10 font-medium">{item.name}</span>
                      </Link>
                    )}
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
                        ? 'text-white shadow-lg hover:shadow-xl'
                        : cta.style === 'secondary'
                        ? 'text-white shadow-md hover:shadow-lg'
                        : cta.style === 'outline'
                        ? 'border-2 hover:text-white shadow-md hover:shadow-lg'
                        : cta.style === 'ghost'
                        ? 'hover:bg-gray-50 border border-gray-200'
                        : 'hover:bg-gray-50'
                    )}
                    style={{
                      backgroundColor: cta.style === 'primary' 
                        ? 'var(--color-primary)'
                        : cta.style === 'secondary'
                        ? 'var(--color-secondary)'
                        : cta.style === 'outline'
                        ? 'transparent'
                        : cta.style === 'ghost'
                        ? 'transparent'
                        : 'transparent',
                      borderColor: cta.style === 'outline' 
                        ? 'var(--color-primary)'
                        : cta.style === 'ghost'
                        ? '#e5e7eb'
                        : 'transparent',
                      color: cta.style === 'primary' || cta.style === 'secondary'
                        ? '#ffffff'
                        : cta.style === 'outline' || cta.style === 'ghost'
                        ? 'var(--color-primary)'
                        : '#374151',
                      boxShadow: cta.style === 'primary'
                        ? `0 10px 25px -5px var(--color-primary)40`
                        : cta.style === 'secondary'
                        ? `0 4px 6px -1px var(--color-secondary)40`
                        : undefined
                    }}
                    onMouseEnter={(e) => {
                      if (cta.style === 'primary') {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                        e.currentTarget.style.boxShadow = `0 20px 40px -10px var(--color-primary)50`;
                      } else if (cta.style === 'secondary') {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                        e.currentTarget.style.boxShadow = `0 10px 25px -5px var(--color-secondary)50`;
                      } else if (cta.style === 'outline') {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.boxShadow = `0 10px 25px -5px var(--color-primary)40`;
                      } else if (cta.style === 'ghost') {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)10';
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (cta.style === 'primary') {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        e.currentTarget.style.boxShadow = `0 10px 25px -5px var(--color-primary)40`;
                      } else if (cta.style === 'secondary') {
                        e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                        e.currentTarget.style.boxShadow = `0 4px 6px -1px var(--color-secondary)40`;
                      } else if (cta.style === 'outline') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-primary)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      } else if (cta.style === 'ghost') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                                         }}
                  >
                    {/* Primary button special effects */}
                    {cta.style === 'primary' && (
                      <>
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        
                        {/* Glow effect */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
                          }}
                        />
                      </>
                    )}
                    
                    {/* Outline button fill effect */}
                    {cta.style === 'outline' && (
                      <div 
                        className="absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                        style={{
                          background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
                        }}
                      />
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
                    {item.children && item.children.length > 0 ? (
                      // Mobile dropdown menu item
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleMobileSubmenu(item.name)}
                          className="relative w-full px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:shadow-lg text-left"
                          style={{
                            color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                          }}
                        >
                          {/* Enhanced background gradient effect */}
                          <div 
                            className="absolute inset-0 transition-all duration-300 rounded-2xl"
                            style={{
                              background: item.isActive 
                                ? `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                                : `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`,
                              opacity: item.isActive ? 1 : 0
                            }}
                          />
                          
                          {/* Sophisticated animated underline */}
                          <motion.div
                            className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                            }}
                            initial={{ scaleX: item.isActive ? 1 : 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          />
                          
                          <span className="relative z-10 flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            
                            {/* Enhanced dropdown arrow */}
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.svg
                                className="w-5 h-5 transition-all duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                animate={{ 
                                  rotate: expandedMobileItems.has(item.name) ? 180 : 0 
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </motion.div>
                          </span>
                        </button>
                        
                        {/* Mobile Submenu */}
                        <AnimatePresence>
                          {expandedMobileItems.has(item.name) && (
                            <motion.div
                              className="ml-4 space-y-1 overflow-hidden"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {item.children.map((child, childIndex) => (
                                <motion.div
                                  key={child.href}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    delay: childIndex * 0.05 + 0.1 
                                  }}
                                >
                                  <Link
                                    href={child.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="group/child relative block px-6 py-3.5 text-base font-medium rounded-xl transition-all duration-300 overflow-hidden hover:scale-[1.02]"
                                    style={{
                                      color: child.isActive ? finalMenuActiveColor : finalMenuTextColor
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!child.isActive) {
                                        (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                                        (e.target as HTMLAnchorElement).style.backgroundColor = `${finalMenuHoverColor}12`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!child.isActive) {
                                        (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                                        (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
                                      }
                                    }}
                                  >
                                    {/* Enhanced hover effect */}
                                    <div 
                                      className="absolute inset-0 opacity-0 group-hover/child:opacity-100 transition-all duration-300 rounded-xl"
                                      style={{
                                        background: `linear-gradient(90deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`
                                      }}
                                    />
                                    
                                    <span className="relative z-10 flex items-center justify-between">
                                      <span className="flex items-center space-x-3">
                                        {/* Enhanced bullet point */}
                                        <motion.span 
                                          className="w-2 h-2 rounded-full" 
                                          style={{ backgroundColor: finalMenuHoverColor }}
                                          whileHover={{ scale: 1.5 }}
                                          transition={{ duration: 0.2 }}
                                        />
                                        <span className="font-medium">{child.name}</span>
                                      </span>
                                      
                                      {/* Smooth arrow transition */}
                                      <motion.svg
                                        className="w-4 h-4 opacity-0 group-hover/child:opacity-70 transition-all duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        initial={{ x: -8 }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                      </motion.svg>
                                    </span>
                                    
                                    {/* Active state indicator */}
                                    {child.isActive && (
                                      <motion.div
                                        className="absolute left-3 top-1/2 w-1 h-4 rounded-full"
                                        style={{ backgroundColor: finalMenuActiveColor }}
                                        initial={{ scale: 0, y: '-50%' }}
                                        animate={{ scale: 1, y: '-50%' }}
                                        transition={{ duration: 0.3 }}
                                      />
                                    )}
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      // Regular mobile menu item
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="relative block px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
                        style={{
                          color: item.isActive ? finalMenuActiveColor : finalMenuTextColor
                        }}
                        onMouseEnter={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuHoverColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!item.isActive) {
                            (e.target as HTMLAnchorElement).style.color = finalMenuTextColor;
                          }
                        }}
                      >
                        {/* Enhanced background gradient effect */}
                        <div 
                          className="absolute inset-0 transition-all duration-300 rounded-2xl"
                          style={{
                            background: item.isActive 
                              ? `linear-gradient(135deg, ${finalMenuActiveColor}12, ${finalMenuActiveColor}20, ${finalMenuActiveColor}12)`
                              : `linear-gradient(135deg, ${finalMenuHoverColor}08, ${finalMenuHoverColor}15, ${finalMenuHoverColor}08)`,
                            opacity: item.isActive ? 1 : 0
                          }}
                          onMouseEnter={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLDivElement).style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!item.isActive) {
                              (e.target as HTMLDivElement).style.opacity = '0';
                            }
                          }}
                        />
                        
                        {/* Sophisticated animated underline */}
                        <motion.div
                          className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${finalMenuHoverColor}, ${finalMenuActiveColor}, ${finalMenuHoverColor})`
                          }}
                          initial={{ scaleX: item.isActive ? 1 : 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        
                        <span className="relative z-10 font-medium">
                          {item.name}
                        </span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
} 
