'use client';

import useSWR from 'swr';
import { apiClient } from '@/lib/api';

// Custom hooks for data fetching
export function useFeatures(highlighted = false) {
  const params = highlighted ? '?filters[isHighlighted][$eq]=true&sort=order:asc' : '';
  return useSWR(`/features${params}`, () => 
    highlighted ? apiClient.getHighlightedFeatures() : apiClient.getFeatures(params)
  );
}

export function useChannels(supported = true) {
  const params = supported ? '?filters[isSupported][$eq]=true' : '';
  return useSWR(`/channels${params}`, () => 
    supported ? apiClient.getSupportedChannels() : apiClient.getChannels(params)
  );
}

export function useTestimonials(featured = true) {
  return useSWR('/testimonials/featured', () => 
    featured ? apiClient.getFeaturedTestimonials() : apiClient.getTestimonials()
  );
}

export function usePricingPlans() {
  return useSWR('/pricing-plans/active', () => apiClient.getActivePricingPlans());
}

export function useFAQs(category?: string) {
  const key = category ? `/faqs/${category}` : '/faqs/active';
  return useSWR(key, () => 
    category ? apiClient.getTechnicalFAQs() : apiClient.getActiveFAQs()
  );
}

export function useHeroSection() {
  return useSWR('/hero-section', () => apiClient.getHeroSection());
}

export function useGlobalSettings() {
  return useSWR('/global-settings', () => apiClient.getGlobalSettings());
} 