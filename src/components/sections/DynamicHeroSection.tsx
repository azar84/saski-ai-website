'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface CTA {
  id: number;
  text: string;
  url: string;
  icon?: string;
  style: string;
  target: string;
  isActive: boolean;
}

interface HeroSectionData {
  id: number;
  layoutType: string;
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
  // Text Colors
  taglineColor: string;
  headlineColor: string;
  subheadingColor: string;
  // CTA Styling
  ctaPrimaryBgColor: string;
  ctaPrimaryTextColor: string;
  ctaSecondaryBgColor: string;
  ctaSecondaryTextColor: string;
  showTypingEffect: boolean;
  enableBackgroundAnimation: boolean;
  customClasses?: string;
  paddingTop: number;
  paddingBottom: number;
  containerMaxWidth: string;
  visible: boolean;
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;
}

interface DynamicHeroSectionProps {
  heroSection: HeroSectionData;
  overrideTitle?: string;
  overrideSubtitle?: string;
  className?: string;
}

const DynamicHeroSection: React.FC<DynamicHeroSectionProps> = ({
  heroSection,
  overrideTitle,
  overrideSubtitle,
  className = ''
}) => {
  const {
    layoutType,
    tagline,
    headline,
    subheading,
    textAlignment,
    mediaUrl,
    mediaType,
    mediaAlt,
    mediaHeight,
    mediaPosition,
    backgroundType,
    backgroundValue,
    taglineColor,
    headlineColor,
    subheadingColor,
    ctaPrimaryBgColor,
    ctaPrimaryTextColor,
    ctaSecondaryBgColor,
    ctaSecondaryTextColor,
    showTypingEffect,
    enableBackgroundAnimation,
    customClasses,
    paddingTop,
    paddingBottom,
    containerMaxWidth,
    ctaPrimary,
    ctaSecondary
  } = heroSection;

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  // Get container max width class
  const getContainerMaxWidth = () => {
    switch (containerMaxWidth) {
      case 'xl': return 'max-w-7xl';
      case '2xl': return 'max-w-screen-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-screen-2xl';
    }
  };

  // Get text alignment class
  const getTextAlignment = () => {
    switch (textAlignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left':
      default: return 'text-left';
    }
  };

  // Get background styles
  const getBackgroundStyles = () => {
    switch (backgroundType) {
      case 'gradient':
        return { background: backgroundValue };
      case 'image':
        return { 
          backgroundImage: `url(${backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'video':
        return { backgroundColor: '#000' }; // Fallback for video
      case 'color':
      default:
        return { backgroundColor: backgroundValue };
    }
  };

  // Determine if text should be light or dark based on background
  const getTextColor = () => {
    if (backgroundType === 'color') {
      // Simple heuristic: if background is dark, use light text
      const hex = backgroundValue.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? 'text-gray-900' : 'text-white';
    }
    // For gradients and images, assume light text
    return 'text-white';
  };

  // Get button style classes with custom colors
  const getButtonClasses = (buttonType: 'primary' | 'secondary', style: string) => {
    const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (buttonType === 'primary' && ctaPrimaryBgColor && ctaPrimaryTextColor) {
      return `${baseClasses} shadow-lg focus:ring-blue-500`;
    } else if (buttonType === 'secondary' && ctaSecondaryBgColor && ctaSecondaryTextColor) {
      return `${baseClasses} shadow-lg focus:ring-purple-500`;
    }
    
    // Fallback to design system colors if custom colors not set
    const textColor = getTextColor();
    const isDarkBackground = textColor === 'text-white';
    
    switch (style) {
      case 'primary':
        return `${baseClasses} ${isDarkBackground 
          ? 'bg-white text-[#5243E9] hover:bg-gray-100 border border-transparent shadow-lg'
          : 'bg-[#5243E9] text-white hover:bg-[#4338CA] border border-transparent shadow-lg'}`;
      case 'secondary':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] border border-transparent shadow-lg'
          : 'bg-gray-600 text-white hover:bg-gray-700 border border-transparent shadow-lg'}`;
      case 'outline':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#5243E9] shadow-lg'
          : 'bg-transparent text-[#5243E9] border-2 border-[#5243E9] hover:bg-[#5243E9] hover:text-white shadow-lg'}`;
      case 'ghost':
        return `${baseClasses} ${isDarkBackground
          ? 'bg-transparent text-white hover:bg-white/10 border border-transparent'
          : 'bg-transparent text-[#5243E9] hover:bg-[#5243E9]/10 border border-transparent'}`;
      default:
        return `${baseClasses} ${isDarkBackground 
          ? 'bg-white text-[#5243E9] hover:bg-gray-100 border border-transparent shadow-lg'
          : 'bg-[#5243E9] text-white hover:bg-[#4338CA] border border-transparent shadow-lg'}`;
    }
  };

  // Render media content
  const renderMedia = () => {
    if (!mediaUrl) return null;

    const mediaClasses = `w-full object-cover rounded-lg shadow-xl`;
    const mediaStyle = { height: mediaHeight };

    switch (mediaType) {
      case 'video':
        if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
          const videoId = mediaUrl.includes('youtu.be') 
            ? mediaUrl.split('/').pop()?.split('?')[0]
            : mediaUrl.split('v=')[1]?.split('&')[0];
          
          return (
            <div className="relative w-full rounded-lg overflow-hidden shadow-xl" style={mediaStyle}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <video 
            className={mediaClasses}
            style={mediaStyle}
            controls
            muted
            autoPlay
            loop
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      
      case 'animation':
        return (
          <div className="w-full flex items-center justify-center" style={mediaStyle}>
            <div className="animate-pulse bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg w-full h-full flex items-center justify-center">
              <span className="text-white font-semibold">Animation Placeholder</span>
            </div>
          </div>
        );
      
      case '3d':
        return (
          <div className="w-full flex items-center justify-center" style={mediaStyle}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg w-full h-full flex items-center justify-center">
              <span className="text-white font-semibold">3D Model Placeholder</span>
            </div>
          </div>
        );
      
      case 'image':
      default:
        return (
          <img
            src={mediaUrl}
            alt={mediaAlt || headline}
            className={mediaClasses}
            style={mediaStyle}
          />
        );
    }
  };

  // Render CTAs with custom styling
  const renderCTAs = () => {
    const ctas: React.ReactElement[] = [];

    if (ctaPrimary && ctaPrimary.isActive) {
      const customStyle = ctaPrimaryBgColor && ctaPrimaryTextColor ? {
        backgroundColor: ctaPrimaryBgColor === 'transparent' ? 'transparent' : ctaPrimaryBgColor,
        color: ctaPrimaryTextColor,
        borderColor: ctaPrimaryBgColor === 'transparent' ? ctaPrimaryTextColor : 'transparent'
      } : {};

      ctas.push(
        <motion.a
          key="primary"
          href={ctaPrimary.url}
          target={ctaPrimary.target}
          className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
            ctaPrimaryBgColor && ctaPrimaryTextColor 
              ? 'border-2 hover:opacity-90 shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
              : getButtonClasses('primary', ctaPrimary.style)
          }`}
          style={customStyle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {ctaPrimary.icon && getIconComponent(ctaPrimary.icon)}
          {ctaPrimary.text}
        </motion.a>
      );
    }

    if (ctaSecondary && ctaSecondary.isActive) {
      const customStyle = ctaSecondaryBgColor && ctaSecondaryTextColor ? {
        backgroundColor: ctaSecondaryBgColor === 'transparent' ? 'transparent' : ctaSecondaryBgColor,
        color: ctaSecondaryTextColor,
        borderColor: ctaSecondaryBgColor === 'transparent' ? ctaSecondaryTextColor : 'transparent'
      } : {};

      ctas.push(
        <motion.a
          key="secondary"
          href={ctaSecondary.url}
          target={ctaSecondary.target}
          className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
            ctaSecondaryBgColor && ctaSecondaryTextColor 
              ? 'border-2 hover:opacity-90 shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-purple-500' 
              : getButtonClasses('secondary', ctaSecondary.style)
          }`}
          style={customStyle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {ctaSecondary.icon && getIconComponent(ctaSecondary.icon)}
          {ctaSecondary.text}
        </motion.a>
      );
    }

    return ctas.length > 0 ? (
      <div className={`flex flex-col sm:flex-row gap-4 ${
        textAlignment === 'center' ? 'justify-center' : 
        textAlignment === 'right' ? 'justify-end' : 
        'justify-start'
      }`}>
        {ctas}
      </div>
    ) : null;
  };

  // Layout-specific rendering
  const renderContent = () => {
    const fallbackTextColor = getTextColor(); // Keep as fallback
    const textAlign = getTextAlignment();
    
    const titleElement = (
      <motion.h1 
        className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${textAlign}`}
        style={{ color: headlineColor || (fallbackTextColor === 'text-white' ? '#ffffff' : '#1f2937') }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {overrideTitle || headline}
      </motion.h1>
    );

    const subtitleElement = (overrideSubtitle || subheading) ? (
      <motion.p 
        className={`text-xl lg:text-2xl mb-8 ${textAlign} max-w-3xl ${textAlignment === 'center' ? 'mx-auto' : ''}`}
        style={{ color: subheadingColor || (fallbackTextColor === 'text-white' ? 'rgba(255,255,255,0.9)' : '#4b5563') }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {overrideSubtitle || subheading}
      </motion.p>
    ) : null;

    const taglineElement = tagline ? (
      <motion.div 
        className={`inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium mb-4`}
        style={{ color: taglineColor || (fallbackTextColor === 'text-white' ? '#ffffff' : '#1f2937') }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {tagline}
      </motion.div>
    ) : null;

    const ctasElement = (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {renderCTAs()}
      </motion.div>
    );

    switch (layoutType) {
      case 'centered':
        return (
          <div className="text-center">
            {taglineElement}
            {titleElement}
            {subtitleElement}
            {ctasElement}
            {mediaUrl && (
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {renderMedia()}
              </motion.div>
            )}
          </div>
        );

      case 'overlay':
        return (
          <div className="relative z-10">
            <div className={`${textAlign}`}>
              {taglineElement}
              {titleElement}
              {subtitleElement}
              {ctasElement}
            </div>
            {mediaUrl && (
              <div className="absolute inset-0 -z-10">
                {renderMedia()}
              </div>
            )}
          </div>
        );

      case 'split':
      default:
        const isMediaLeft = mediaPosition === 'left';
        return (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isMediaLeft ? 'lg:flex-row-reverse' : ''}`}>
            <motion.div 
              className={`${textAlign} ${isMediaLeft ? 'lg:order-2' : ''}`}
              initial={{ opacity: 0, x: isMediaLeft ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {taglineElement}
              {titleElement}
              {subtitleElement}
              {ctasElement}
            </motion.div>
            {mediaUrl && (
              <motion.div 
                className={`${isMediaLeft ? 'lg:order-1' : ''}`}
                initial={{ opacity: 0, x: isMediaLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {renderMedia()}
              </motion.div>
            )}
          </div>
        );
    }
  };

  return (
    <section 
      className={`relative overflow-hidden ${customClasses || ''} ${className}`}
      style={{
        ...getBackgroundStyles(),
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        minHeight: layoutType === 'overlay' ? mediaHeight : 'auto'
      }}
    >
      {/* Background Animation */}
      {enableBackgroundAnimation && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        </div>
      )}

      {/* Background Video */}
      {backgroundType === 'video' && (
        <div className="absolute inset-0 -z-10">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundValue} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}

      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${getContainerMaxWidth()} relative z-10`}>
        {renderContent()}
      </div>
    </section>
  );
};

export default DynamicHeroSection; 