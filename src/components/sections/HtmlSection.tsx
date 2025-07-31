'use client';

import React, { useEffect, useState, useRef } from 'react';

interface HtmlSectionProps {
  htmlSection: {
    id: number;
    name: string;
    description?: string;
    htmlContent: string;
    cssContent?: string;
    jsContent?: string;
    isActive: boolean;
  };
  className?: string;
}

const HtmlSection: React.FC<HtmlSectionProps> = ({ htmlSection, className = '' }) => {
  const [isReady, setIsReady] = useState(false);
  const [htmlRendered, setHtmlRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Wait for component to be fully mounted and stable
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100); // Small delay to ensure everything is stable

    return () => clearTimeout(timer);
  }, []);

  // Mark HTML as rendered after a brief delay
  useEffect(() => {
    if (isReady && htmlSection.htmlContent) {
      const timer = setTimeout(() => {
        setHtmlRendered(true);
      }, 50); // Brief delay to ensure HTML is rendered

      return () => clearTimeout(timer);
    }
  }, [isReady, htmlSection.htmlContent]);

  useEffect(() => {
    if (!htmlSection.isActive || !isReady || !htmlRendered) return;

    // Additional safety checks
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    let styleElement: HTMLStyleElement | null = null;

    // Add CSS styles if provided
    if (htmlSection.cssContent?.trim()) {
      try {
        // Remove any existing styles for this section
        const existingStyles = document.querySelectorAll(`[data-html-section-id="${htmlSection.id}"]`);
        existingStyles.forEach(el => {
          if (el.tagName === 'STYLE') {
            el.remove();
          }
        });

        styleElement = document.createElement('style');
        styleElement.textContent = htmlSection.cssContent;
        styleElement.setAttribute('data-html-section-id', htmlSection.id.toString());
        
        // Use a more reliable method to append
        if (document.head) {
          document.head.appendChild(styleElement);
        }
      } catch (error) {
        console.error(`Error adding CSS for HTML section ${htmlSection.id}:`, error);
      }
    }

    // Add JavaScript if provided - with additional safety checks
    if (htmlSection.jsContent?.trim()) {
      try {
        // Temporarily disable JavaScript injection to prevent appendChild errors
        console.warn('JavaScript injection disabled for HTML section to prevent DOM manipulation errors');
        
        // For now, just log that JavaScript was found but not executed
        console.log(`HTML section ${htmlSection.id} has JavaScript content but execution is disabled for safety`);
        
        // TODO: Re-enable JavaScript injection with better error handling in the future
      } catch (error) {
        console.error(`Error processing JavaScript for HTML section ${htmlSection.id}:`, error);
      }
    }

    // Cleanup function
    return () => {
      if (styleElement) {
        try {
          styleElement.remove();
        } catch (error) {
          console.warn('Error removing style during cleanup:', error);
        }
      }
    };
  }, [htmlSection, isReady, htmlRendered]);

  // Don't render if section is inactive
  if (!htmlSection.isActive) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      data-html-section-id={htmlSection.id}
      dangerouslySetInnerHTML={{ __html: htmlSection.htmlContent }}
    />
  );
};

export default HtmlSection; 