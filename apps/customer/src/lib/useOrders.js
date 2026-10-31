import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ACTIVE_STATUS_KEYS } from './orderStatus';
import { useUserStore } from '../store/userStore';
import api from './api';

/**
 * Custom hook managing customer orders via TanStack Query.
 * Fetches real orders from MongoDB (/api/orders?phone=...).
 * Automated 8-second polling (refetchInterval) whenever active orders are present.
 */
export function useOrders() {
  const queryClient = useQueryClient();
  const phone = useUserStore((state) => state.phone);

  const query = useQuery({
    queryKey: ['orders', phone],
    queryFn: async () => {
      try {
        const params = {};
        if (phone) params.phone = phone;

        const res = await api.get('/orders', { params });
        const list = res?.data?.orders || res?.data?.data;
        if (res?.data?.success && Array.isArray(list)) {
          return list.map((o) => ({
            ...o,
            id: o.orderNumber || o.orderId || o.id || o._id,
            displayId: o.displayId || o.orderNumber || o.orderId || `#${String(o._id || '').slice(-6).toUpperCase()}`,
            totalAmount: o.totalAmount || o.bill?.total || 0,
            deliveryFee: o.deliveryFee ?? o.bill?.delivery ?? 0,
            subtotal: o.subtotal || o.bill?.subtotal || 0,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch orders from DB:', err.message);
      }

      return [];
    },
    refetchInterval: (q) => {
      const orders = q.state.data;
      if (!orders) return false;
      const hasActive = orders.some((o) => ACTIVE_STATUS_KEYS.includes(o.status));
      return hasActive ? 8000 : false;
    },
    staleTime: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const res = await api.put(`/orders/${orderId}/cancel`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (orderData) => {
      const res = await api.post('/orders', orderData);
      return res.data?.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    cancelOrder: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    addOrder: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
  };
}
