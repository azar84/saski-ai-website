'use client';

import { useEffect } from 'react';

interface DesignSystem {
  id?: number;
  // Brand Colors
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColor: string;
  accentColor: string;
  // Semantic Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  // Neutral Colors
  grayLight: string;
  grayMedium: string;
  grayDark: string;
  // Background Colors
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDark: string;
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Typography
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  lineHeightBase: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  // Spacing Scale
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  // Border Radius
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  borderRadiusXl: string;
  borderRadiusFull: string;
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  // Animation Durations
  animationFast: string;
  animationNormal: string;
  animationSlow: string;
  // Breakpoints
  breakpointSm: string;
  breakpointMd: string;
  breakpointLg: string;
  breakpointXl: string;
  breakpoint2xl: string;
  // Theme Mode
  themeMode: 'light' | 'dark' | 'auto';
  // Custom Variables
  customVariables?: string;
}

const applyDesignSystemToRoot = (ds: DesignSystem) => {
  const root = document.documentElement;
  
  // Override the existing CSS variables from globals.css with database values
  
  // Brand Colors (override --color-primary variants)
  root.style.setProperty('--color-primary', ds.primaryColor);
  root.style.setProperty('--color-primary-light', ds.primaryColorLight);
  root.style.setProperty('--color-primary-dark', ds.primaryColorDark);
  
  // Semantic Colors (override existing --color-success, etc.)
  root.style.setProperty('--color-success', ds.successColor);
  root.style.setProperty('--color-warning', ds.warningColor);
  root.style.setProperty('--color-error', ds.errorColor);
  root.style.setProperty('--color-info', ds.infoColor);
  
  // Typography (override existing font families)
  root.style.setProperty('--font-family-sans', ds.fontFamily);
  root.style.setProperty('--font-family-mono', ds.fontFamilyMono);
  
  // Update gradients to use new colors
  root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${ds.primaryColor} 0%, ${ds.secondaryColor} 100%)`);
  root.style.setProperty('--gradient-card', `linear-gradient(145deg, ${ds.primaryColor}1A 0%, ${ds.secondaryColor}0D 100%)`);
  root.style.setProperty('--gradient-mesh', `radial-gradient(ellipse at top, ${ds.primaryColor}4D, transparent 50%)`);
  
  // Update selection and focus colors
  const style = document.createElement('style');
  style.textContent = `
    ::selection {
      background: ${ds.primaryColor} !important;
      color: #FFFFFF !important;
    }
    
    :focus-visible {
      outline: 2px solid ${ds.primaryColor} !important;
      outline-offset: 2px !important;
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${ds.primaryColor} !important;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${ds.primaryColorDark} !important;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, ${ds.primaryColor} 0%, ${ds.secondaryColor} 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
  `;
  
  // Remove existing dynamic styles and add new ones
  const existingStyle = document.getElementById('dynamic-design-system');
  if (existingStyle) {
    existingStyle.remove();
  }
  style.id = 'dynamic-design-system';
  document.head.appendChild(style);

  // Apply custom variables if they exist
  if (ds.customVariables) {
    try {
      const customVars = JSON.parse(ds.customVariables);
      Object.entries(customVars).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value as string);
      });
    } catch (error) {
      console.warn('Failed to parse custom variables:', error);
    }
  }

  // Apply theme mode class
  root.setAttribute('data-theme', ds.themeMode);
  
  console.log('Design system applied to existing CSS variables:', ds);
};

const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const loadDesignSystem = async () => {
      try {
        const response = await fetch('/api/admin/design-system');
        const result = await response.json();

        if (result.success) {
          applyDesignSystemToRoot(result.data);
        } else {
          console.warn('Failed to load design system:', result.message);
        }
      } catch (error) {
        console.error('Failed to fetch design system:', error);
      }
    };

    loadDesignSystem();
  }, []);

  return <>{children}</>;
};

export default DesignSystemProvider; 
