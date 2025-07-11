import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export function useAdminApi() {
  const [loading, setLoading] = useState(false);

  const apiCall = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generic CRUD operations
  const get = useCallback(<T>(url: string) => apiCall<T>(url), [apiCall]);
  
  const post = useCallback(<T>(url: string, data: unknown) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json() as Promise<T>), []);
  
  const put = useCallback(<T>(url: string, data: unknown) =>
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json() as Promise<T>), []);
  
  const del = useCallback(<T>(url: string) => 
    apiCall<T>(url, { method: 'DELETE' }), [apiCall]);

  return {
    loading,
    get,
    post,
    put,
    delete: del,
    apiCall,
  };
}
