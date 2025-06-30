'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5243E9]/5 via-[#7C3AED]/3 to-[#06B6D4]/5 pointer-events-none" />
      
      {/* Main container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Section header with description */}
        {htmlSection.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4 font-manrope">
              {htmlSection.name}
            </h2>
            <p className="text-lg text-[#6B7280] max-w-3xl mx-auto leading-relaxed font-manrope">
              {htmlSection.description}
            </p>
          </motion.div>
        )}

        {/* HTML content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Content wrapper with enhanced styling */}
          <div 
            ref={containerRef}
            className={`
              html-section-content
              relative
              bg-white/80 backdrop-blur-sm
              rounded-2xl
              border border-[#5243E9]/10
              shadow-lg shadow-[#5243E9]/5
              overflow-hidden
              transition-all duration-300
              hover:shadow-xl hover:shadow-[#5243E9]/10
              hover:border-[#5243E9]/20
              group
            `}
            data-html-section-id={htmlSection.id}
            data-html-section-name={htmlSection.name}
          >
            {/* Subtle gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#5243E9]/5 via-transparent to-[#7C3AED]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Content padding */}
            <div className="relative p-6 lg:p-8">
              <div 
                className="html-content-wrapper"
                dangerouslySetInnerHTML={{ __html: htmlSection.htmlContent }}
              />
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5243E9] via-[#7C3AED] to-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-[#5243E9]/10 to-[#7C3AED]/10 rounded-full blur-xl opacity-60" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-[#06B6D4]/10 to-[#5243E9]/10 rounded-full blur-xl opacity-40" />
      </div>

      {/* Enhanced CSS for HTML content styling */}
      <style jsx>{`
        .html-section-content {
          font-family: 'Manrope', sans-serif;
        }
        
        .html-content-wrapper {
          /* Enhanced typography for HTML content */
          font-family: 'Manrope', sans-serif;
          line-height: 1.6;
          color: #1F2937;
        }
        
        .html-content-wrapper h1,
        .html-content-wrapper h2,
        .html-content-wrapper h3,
        .html-content-wrapper h4,
        .html-content-wrapper h5,
        .html-content-wrapper h6 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        
        .html-content-wrapper h1 {
          font-size: 2.5rem;
          color: #5243E9;
        }
        
        .html-content-wrapper h2 {
          font-size: 2rem;
          color: #5243E9;
        }
        
        .html-content-wrapper h3 {
          font-size: 1.5rem;
          color: #7C3AED;
        }
        
        .html-content-wrapper p {
          margin-bottom: 1.5rem;
          color: #6B7280;
          font-size: 1.125rem;
        }
        
        .html-content-wrapper a {
          color: #5243E9;
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }
        
        .html-content-wrapper a:hover {
          color: #7C3AED;
          border-bottom-color: #7C3AED;
        }
        
        .html-content-wrapper ul,
        .html-content-wrapper ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .html-content-wrapper li {
          margin-bottom: 0.5rem;
          color: #6B7280;
        }
        
        .html-content-wrapper blockquote {
          border-left: 4px solid #5243E9;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #7C3AED;
          background: linear-gradient(135deg, #5243E9/5, #7C3AED/5);
          padding: 1.5rem;
          border-radius: 0 12px 12px 0;
        }
        
        .html-content-wrapper code {
          background: #F6F8FC;
          color: #5243E9;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-family: 'ui-monospace', monospace;
          font-size: 0.875rem;
        }
        
        .html-content-wrapper pre {
          background: #0F1A2A;
          color: #F9FAFB;
          padding: 1.5rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #374151;
        }
        
        .html-content-wrapper pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        
        .html-content-wrapper table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .html-content-wrapper th,
        .html-content-wrapper td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .html-content-wrapper th {
          background: linear-gradient(135deg, #5243E9, #7C3AED);
          color: white;
          font-weight: 600;
        }
        
        .html-content-wrapper tr:nth-child(even) {
          background: #F9FAFB;
        }
        
        .html-content-wrapper tr:hover {
          background: #F6F8FC;
        }
        
        .html-content-wrapper img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .html-content-wrapper img:hover {
          transform: scale(1.02);
        }
        
        .html-content-wrapper button,
        .html-content-wrapper .btn {
          background: linear-gradient(135deg, #5243E9, #7C3AED);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(82, 67, 233, 0.3);
        }
        
        .html-content-wrapper button:hover,
        .html-content-wrapper .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(82, 67, 233, 0.4);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .html-content-wrapper h1 {
            font-size: 2rem;
          }
          
          .html-content-wrapper h2 {
            font-size: 1.75rem;
          }
          
          .html-content-wrapper h3 {
            font-size: 1.25rem;
          }
          
          .html-content-wrapper p {
            font-size: 1rem;
          }
        }
      `}</style>
    </motion.section>
  );
};

export default HtmlSection; 