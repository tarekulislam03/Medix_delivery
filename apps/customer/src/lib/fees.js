export const MIN_ORDER = 500;
export const DISCOUNTED_DELIVERY_AT = 1500;
export const BASE_DELIVERY_FEE = 18;
export const DISCOUNTED_DELIVERY_FEE = 5; // 70% off ₹18 (rounded to ₹5)
export const PLATFORM_FEE = 6;
export const DISCOUNT_PERCENT = 17;

export const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (amount) => inrFormatter.format(amount || 0);

/**
 * Pure function to calculate bill breakdown and order eligibility.
 * 1. Subtotal (Item Total)
 * 2. 17% Flat Discount (applied immediately on all medicines)
 * 3. Delivery Fee: ₹18, or ₹5 (70% OFF) on orders >= ₹1,500
 * 4. Constant Platform Fee: ₹6
 *
 * @param {number} subtotal
 */
export function calcBill(subtotal = 0) {
  const canOrder = subtotal >= MIN_ORDER;
  const toMin = Math.max(0, MIN_ORDER - subtotal);
  const toDeliveryDiscount = Math.max(0, DISCOUNTED_DELIVERY_AT - subtotal);
  const isDeliveryDiscounted = subtotal >= DISCOUNTED_DELIVERY_AT;

  // 1. 17% Flat Discount applies directly to the medicine subtotal
  const discount = Math.round((subtotal * DISCOUNT_PERCENT) / 100);

  // 2. Delivery fee: ₹5 (70% OFF) if subtotal >= 1500, else ₹18
  const delivery = subtotal > 0 ? (isDeliveryDiscounted ? DISCOUNTED_DELIVERY_FEE : BASE_DELIVERY_FEE) : 0;

  // 3. Constant platform fee: ₹6
  const platform = subtotal > 0 ? PLATFORM_FEE : 0;

  const total = Math.max(0, subtotal - discount + delivery + platform);

  return {
    subtotal,
    discount,
    delivery,
    platform,
    total,
    canOrder,
    toMin,
    toDeliveryDiscount,
    discountPercent: DISCOUNT_PERCENT,
    isDeliveryDiscounted,
    baseDeliveryFee: BASE_DELIVERY_FEE,
    discountedDeliveryFee: DISCOUNTED_DELIVERY_FEE,
  };
}
