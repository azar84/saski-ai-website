import React from 'react';
import { Play, CheckCircle, ArrowRight } from 'lucide-react';

interface MediaSectionFeature {
  id: number;
  icon: string;
  label: string;
  color: string;
  sortOrder: number;
}

interface MediaSectionProps {
  id: number;
  headline: string;
  subheading?: string;
  mediaUrl: string;
  mediaType: string;
  layoutType: string;
  badgeText?: string;
  badgeColor?: string;
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
  features: MediaSectionFeature[];
  className?: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  headline,
  subheading,
  mediaUrl,
  mediaType,
  layoutType,
  badgeText,
  badgeColor = '#5243E9',
  alignment,
  mediaSize,
  mediaPosition,
  showBadge,
  showCtaButton,
  ctaText,
  ctaUrl,
  ctaStyle,
  backgroundStyle,
  backgroundColor,
  textColor,
  paddingTop,
  paddingBottom,
  containerMaxWidth,
  features = [],
  className = ''
}) => {
  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getContainerMaxWidth = () => {
    switch (containerMaxWidth) {
      case 'xl': return 'max-w-7xl';
      case '2xl': return 'max-w-8xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-7xl';
    }
  };

  const getMediaSizeClass = () => {
    switch (mediaSize) {
      case 'sm': return 'w-full max-w-md';
      case 'md': return 'w-full max-w-lg';
      case 'lg': return 'w-full max-w-2xl';
      case 'full': return 'w-full';
      default: return 'w-full max-w-lg';
    }
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'left': 
      default: return 'text-left';
    }
  };

  const getCtaButtonClass = () => {
    switch (ctaStyle) {
      case 'secondary': return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      case 'link': return 'bg-transparent text-blue-600 hover:text-blue-800 underline';
      case 'primary':
      default: return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const renderMedia = () => {
    if (mediaType === 'video') {
      const videoId = getVideoId(mediaUrl);
      if (videoId) {
        return (
          <div className={`relative ${getMediaSizeClass()} mx-auto`}>
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Video"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      }
    }
    
    // Default to image for other media types or fallback
    return (
      <div className={`${getMediaSizeClass()} mx-auto`}>
        <img
          src={mediaUrl}
          alt={headline}
          className="w-full h-auto rounded-lg shadow-2xl"
        />
      </div>
    );
  };

  const renderFeatures = () => {
    if (features.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {features
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((feature) => (
            <div key={feature.id} className="flex items-center space-x-3">
              <div 
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: feature.color }}
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium" style={{ color: textColor }}>
                {feature.label}
              </span>
            </div>
          ))}
      </div>
    );
  };

  const isMediaLeft = mediaPosition === 'left';
  const isStacked = layoutType === 'stacked';

  return (
    <section 
      className={`py-24 ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`
      }}
    >
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${getContainerMaxWidth()}`}>
        {isStacked ? (
          // Stacked layout
          <div className="space-y-12">
            <div className={`${getAlignmentClass()}`}>
              {showBadge && badgeText && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6"
                     style={{ backgroundColor: badgeColor, color: 'white' }}>
                  {badgeText}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                {headline}
              </h2>
              {subheading && (
                <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8">
                  {subheading}
                </p>
              )}
              {showCtaButton && ctaText && ctaUrl && (
                <div className="mb-8">
                  <a
                    href={ctaUrl}
                    className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${getCtaButtonClass()}`}
                  >
                    {ctaText}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </div>
              )}
              {renderFeatures()}
            </div>
            <div className="flex justify-center">
              {renderMedia()}
            </div>
          </div>
        ) : (
          // Side-by-side layout
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isMediaLeft ? 'lg:grid-flow-col-dense' : ''}`}>
            <div className={`${getAlignmentClass()} ${isMediaLeft ? 'lg:col-start-2' : ''}`}>
              {showBadge && badgeText && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6"
                     style={{ backgroundColor: badgeColor, color: 'white' }}>
                  {badgeText}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                {headline}
              </h2>
              {subheading && (
                <p className="text-lg sm:text-xl opacity-90 mb-8">
                  {subheading}
                </p>
              )}
              {showCtaButton && ctaText && ctaUrl && (
                <div className="mb-8">
                  <a
                    href={ctaUrl}
                    className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${getCtaButtonClass()}`}
                  >
                    {ctaText}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </div>
              )}
              {renderFeatures()}
            </div>
            <div className={`${isMediaLeft ? 'lg:col-start-1' : ''}`}>
              {renderMedia()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaSection; 
