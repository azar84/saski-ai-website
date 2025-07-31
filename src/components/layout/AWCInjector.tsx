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

  return null;
};

export default AWCInjector; 