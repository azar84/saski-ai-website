'use client';

import React, { useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!htmlSection.isActive) return;

    // Clean up previous styles and scripts
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    // Add CSS styles if provided
    if (htmlSection.cssContent?.trim()) {
      const style = document.createElement('style');
      style.textContent = htmlSection.cssContent;
      style.setAttribute('data-html-section-id', htmlSection.id.toString());
      document.head.appendChild(style);
      styleRef.current = style;
    }

    // Add JavaScript if provided
    if (htmlSection.jsContent?.trim()) {
      try {
        const script = document.createElement('script');
        script.textContent = htmlSection.jsContent;
        script.setAttribute('data-html-section-id', htmlSection.id.toString());
        document.body.appendChild(script);
        scriptRef.current = script;
      } catch (error) {
        console.error(`Error executing JavaScript for HTML section ${htmlSection.id}:`, error);
      }
    }

    // Cleanup function
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [htmlSection]);

  // Don't render if section is inactive
  if (!htmlSection.isActive) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`html-section ${className}`}
      data-html-section-id={htmlSection.id}
      data-html-section-name={htmlSection.name}
    >
      <div 
        dangerouslySetInnerHTML={{ __html: htmlSection.htmlContent }}
      />
    </div>
  );
};

export default HtmlSection; 