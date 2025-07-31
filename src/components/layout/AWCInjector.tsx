'use client';

import { useEffect } from 'react';

const AWCInjector: React.FC = () => {
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const awc = urlParams.get('awc');

      if (awc) {
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `awc=${encodeURIComponent(awc)}; expires=${expires}; path=/; domain=.saskiai.com; Secure; SameSite=Strict`;
      }
    } catch (error) {
      console.warn('AWC script error:', error);
    }
  }, []);

  // Add defensive canvas protection
  useEffect(() => {
    // Override getContext to prevent errors when canvas doesn't exist
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(contextId, ...args) {
      try {
        if (this && this.getContext) {
          return originalGetContext.call(this, contextId, ...args);
        }
        return null;
      } catch (error) {
        console.warn('Canvas getContext error prevented:', error);
        return null;
      }
    };

    // Cleanup function
    return () => {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    };
  }, []);

  return null;
};

export default AWCInjector; 