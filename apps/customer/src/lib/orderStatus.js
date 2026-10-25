import { useLangStore, translate } from './i18n';

const currentLocale = () => (useLangStore.getState().lang === 'bn' ? 'bn-IN' : 'en-IN');
const currentLang = () => useLangStore.getState().lang;

export const ORDER_STATUSES = {
  SEARCHING: {
    key: 'SEARCHING',
    label: 'Finding Pharmacy',
    stepIndex: 0,
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    dotClass: 'bg-amber-500',
  },
  PLACED: {
    key: 'PLACED',
    label: 'Order Placed',
    stepIndex: 0,
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    dotClass: 'bg-amber-500',
  },
  CONFIRMED: {
    key: 'CONFIRMED',
    label: 'Confirmed',
    stepIndex: 1,
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    dotClass: 'bg-blue-500',
  },
  PACKED: {
    key: 'PACKED',
    label: 'Packed',
    stepIndex: 2,
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    dotClass: 'bg-blue-500',
  },
  OUT_FOR_DELIVERY: {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    stepIndex: 3,
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    dotClass: 'bg-blue-500',
  },
  DELIVERED: {
    key: 'DELIVERED',
    label: 'Delivered',
    stepIndex: 4,
    color: 'green',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    dotClass: 'bg-emerald-500',
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'Cancelled',
    stepIndex: -1,
    color: 'red',
    badgeClass: 'bg-red-50 text-red-700 border-red-200/60',
    dotClass: 'bg-red-500',
  },
};

export const STEPPER_STEPS = [
  { key: 'PLACED', label: 'Order placed', index: 0 },
  { key: 'CONFIRMED', label: 'Pharmacy confirmed', index: 1 },
  { key: 'PACKED', label: 'Packed', index: 2 },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', index: 3 },
  { key: 'DELIVERED', label: 'Delivered', index: 4 },
];

export const ACTIVE_STATUS_KEYS = ['SEARCHING', 'PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'];
export const PAST_STATUS_KEYS = ['DELIVERED', 'CANCELLED'];

/**
 * Format timestamps with relative date for today, otherwise short date.
 * e.g., "Today, 4:32 PM" or "18 Oct, 2:15 PM"
 */
export function formatOrderTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString(currentLocale(), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `${translate(currentLang(), 'Today')}, ${timeString}`;
  }

  const dateString = date.toLocaleDateString(currentLocale(), {
    day: 'numeric',
    month: 'short',
  });

  return `${dateString}, ${timeString}`;
}

/**
 * Format Month & Year for sticky group headers.
 * e.g. "October 2026"
 */
export function formatMonthYear(dateInput) {
  if (!dateInput) return translate(currentLang(), 'Past Orders');
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return translate(currentLang(), 'Past Orders');

  return date.toLocaleDateString(currentLocale(), {
    month: 'long',
    year: 'numeric',
  });
}
