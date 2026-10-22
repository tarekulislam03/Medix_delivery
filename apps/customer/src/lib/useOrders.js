import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMockOrders, cancelMockOrder, addMockOrder } from './mockOrders';
import { ACTIVE_STATUS_KEYS } from './orderStatus';

/**
 * Custom hook managing customer orders via TanStack Query.
 * Includes automated 10-second polling (refetchInterval) whenever active orders are present.
 */
export function useOrders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // Simulate 400ms network latency
      await new Promise((resolve) => setTimeout(resolve, 400));
      return getMockOrders();
    },
    refetchInterval: (q) => {
      const orders = q.state.data;
      if (!orders) return false;
      const hasActive = orders.some((o) => ACTIVE_STATUS_KEYS.includes(o.status));
      return hasActive ? 10000 : false;
    },
    staleTime: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      cancelMockOrder(orderId, reason);
      return { success: true, orderId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (orderData) => {
      const created = addMockOrder(orderData);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    cancelOrder: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    addOrder: addMutation.mutateAsync,
  };
}
