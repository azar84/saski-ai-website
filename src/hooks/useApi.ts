'use client';

import useSWR from 'swr';

// Simple data fetching hooks
export function useFeatures() {
  return useSWR('/api/features', (url) => fetch(url).then(res => res.json()));
}

export function useChannels() {
  return useSWR('/api/channels', (url) => fetch(url).then(res => res.json()));
}

export function useTestimonials() {
  return useSWR('/api/testimonials', (url) => fetch(url).then(res => res.json()));
}

export function usePricingPlans() {
  return useSWR('/api/pricing', (url) => fetch(url).then(res => res.json()));
}

export function useFAQs() {
  return useSWR('/api/faqs', (url) => fetch(url).then(res => res.json()));
}

export function useHeroSection() {
  return useSWR('/api/hero', (url) => fetch(url).then(res => res.json()));
}

export function useGlobalSettings() {
  return useSWR('/api/settings', (url) => fetch(url).then(res => res.json()));
} 