import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from './api';
import { mockMedicines } from './mockMedicines';

/**
 * Custom hook to search and fetch medicines with debouncing, fast caching,
 * and resilient offline/error fallback so the screen NEVER goes blank.
 */
export function useMedicines({ query = '', category = 'All', popular = false, limit = 60 } = {}) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query by 150ms to ensure lag-free typing on mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const queryInfo = useQuery({
    queryKey: ['medicines', debouncedQuery, category, popular, limit],
    queryFn: async () => {
      try {
        const params = { limit };
        if (debouncedQuery) {
          params.q = debouncedQuery;
        }
        if (category && category !== 'All') {
          params.category = category;
        }
        if (popular && !debouncedQuery) {
          params.popular = 'true';
        }

        const response = await api.get('/medicines', { params });
        const data = response?.data;

        // Ensure data is an array (protect against HTML error pages)
        if (Array.isArray(data)) {
          return data.map((m) => ({
            id: m._id || m.slug || m.id,
            name: m.name,
            price: Number(m.price) || 50,
            category: m.category || 'General Healthcare',
            strength: m.strength || m.category || '',
            popular: Boolean(m.popular),
            requiresRx: Boolean(m.requiresRx),
          }));
        }

        console.warn('API returned non-array data, using fallback medicines:', data);
        return getFallbackMedicines(debouncedQuery, category);
      } catch (err) {
        console.error('Failed to fetch medicines from API, using fallback:', err.message);
        return getFallbackMedicines(debouncedQuery, category);
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...queryInfo,
    medicines: Array.isArray(queryInfo.data) ? queryInfo.data : [],
    isSearching: query.trim() !== debouncedQuery,
  };
}

/**
 * Offline / error fallback filter
 */
function getFallbackMedicines(query = '', category = 'All') {
  let list = mockMedicines;
  if (category && category !== 'All') {
    list = list.filter((m) => m.category === category);
  }
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q))
    );
  } else {
    list = list.filter((m) => m.popular);
  }
  return list;
}

/**
 * Fetch distinct categories from backend
 */
export function useMedicineCategories() {
  return useQuery({
    queryKey: ['medicine-categories'],
    queryFn: async () => {
      try {
        const response = await api.get('/medicines/categories');
        if (Array.isArray(response?.data)) {
          return response.data;
        }
        return [];
      } catch (err) {
        console.warn('Failed to fetch categories from API:', err.message);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}
