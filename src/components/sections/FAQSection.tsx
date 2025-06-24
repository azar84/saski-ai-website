'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  heading?: string;
  subheading?: string;
  linkText?: string;
  linkHref?: string;
  faqs?: FAQItem[];
  className?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    id: 1,
    question: "How many languages do our AI agents support?",
    answer: "AI agents built on Saski AI can understand and respond to customers in 12 languages, making it easy for businesses to support customers worldwide. Once deployed, your agents automatically detect the language of each customer message and provide natural, accurate replies — no manual configuration needed. The supported languages include: English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Japanese, Korean, Arabic, and Chinese (Simplified). This multilingual capability allows small businesses to deliver consistent, 24/7 customer support across global markets — without hiring multilingual staff or adding extra tools."
  },
  {
    id: 2,
    question: "What type of content can I upload to teach my AI agent?",
    answer: "You can upload PDFs, Word documents, text files, or simply paste in content directly. You can also provide website URLs, and the system will extract content automatically. This flexibility allows you to build a rich knowledge base using your existing materials."
  },
  {
    id: 3,
    question: "Do I need to be technical to use it?",
    answer: "No technical skills are needed. Saski AI is designed to eliminate the complexity you'll find on other platforms. You simply follow a short guided flow where you: Enter your agent name and description, Select from ready-made templates, Connect your knowledge base (by uploading files or adding website links). Once done, your agent is created and ready to use, usually in less than a minute. There's no need to build conversation flows, set up logic trees, or handle any coding."
  },
  {
    id: 4,
    question: "On which channels can I deploy my AI agent?",
    answer: "Your Saski AI agent can be deployed across all major customer touchpoints, allowing you to serve customers wherever they engage with your business. Supported channels include: Your website (web chat widget), WordPress, Shopify, SMS, WhatsApp, Voice (phone systems), Facebook Messenger. Everything is managed directly inside the platform. You simply choose the channels you want to activate — no coding, no complicated setup, and your agent is live within minutes, providing consistent support across all platforms."
  },
  {
    id: 5,
    question: "How long does setup take?",
    answer: "You can have your first AI assistant created and deployed within 5 minutes. The entire process is fully guided, so you can start automating customer support the same day — without needing technical expertise or lengthy setup."
  }
];

const FAQSection: React.FC<FAQSectionProps> = ({
  heading = "Frequently Asked Questions",
  subheading = "Didn't find your answer?",
  linkText = "Check our FAQs page",
  linkHref = "/faq",
  faqs = defaultFAQs,
  className = ""
}) => {
  // Pre-open the first item by default
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([1]));

  const toggleItem = (id: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id);
    } else {
      newExpandedItems.add(id);
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <section className={`py-20 bg-gradient-to-b from-[#F6F8FC] to-[#FBFBFB] ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Column - Content (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F1A2A] leading-tight" style={{fontFamily: 'Manrope, sans-serif'}}>
                {heading}
              </h2>
              
              <p className="text-[#475569] leading-snug text-lg" style={{fontFamily: 'Manrope, sans-serif'}}>
                Get instant answers to common questions about Saski AI's features, setup process, and capabilities.
              </p>
            </div>

            {/* CTA Box */}
            <div className="bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[#5243E9]" />
                <p className="text-sm font-medium text-[#475569]" style={{fontFamily: 'Manrope, sans-serif'}}>
                  {subheading}
                </p>
              </div>
              <Link 
                href={linkHref}
                className="inline-flex items-center text-[#5243E9] font-semibold hover:text-[#4338CA] transition-colors duration-200 underline underline-offset-2"
                style={{fontFamily: 'Manrope, sans-serif'}}
              >
                {linkText}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Decorative gradient bar */}
            <div className="w-24 h-1 bg-gradient-to-r from-[#5243E9] to-[#7C3AED] rounded-full"></div>
          </div>

          {/* Right Column - FAQ Accordion (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={faq.id}
                className="border border-[#CBD4E1] shadow-sm rounded-xl bg-white hover:shadow-md hover:border-[#5243E9] transition-all duration-300 overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <button
                  className="w-full px-6 py-5 text-left hover:bg-[#F8FAFC] transition-colors duration-200 flex items-start justify-between group"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={expandedItems.has(faq.id)}
                >
                  <div className="flex items-start gap-4 flex-1 pr-4">
                    {/* Number pill */}
                    <div className="text-xs bg-[#E2E8F0] text-[#5243E9] px-2 py-1 rounded-full font-semibold flex-shrink-0 mt-1" style={{fontFamily: 'Manrope, sans-serif'}}>
                      {faq.id}
                    </div>
                    
                    <h4 className="text-lg font-semibold text-[#0F1A2A] leading-tight group-hover:text-[#5243E9] transition-colors duration-200" style={{fontFamily: 'Manrope, sans-serif'}}>
                      {faq.question}
                    </h4>
                  </div>
                  
                  <div className="flex-shrink-0 mt-1">
                    <ChevronDown 
                      className={`w-5 h-5 text-[#64748B] group-hover:text-[#5243E9] transition-all duration-300 ${
                        expandedItems.has(faq.id) ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </div>
                </button>
                
                {expandedItems.has(faq.id) && (
                  <div 
                    className="px-6 pb-6 pt-4 bg-white border-t border-[#E2E8F0] animate-fadeIn"
                    style={{
                      animation: 'slideDown 0.3s ease-out forwards'
                    }}
                  >
                    <div className="text-[#475569] leading-relaxed pl-8" style={{fontFamily: 'Manrope, sans-serif'}}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};

export default FAQSection; 