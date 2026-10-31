import Cart from '../models/Cart.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { normalizePhone } from '../utils/phone.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Server-side fee and discount calculation rule engine.
 * Never trust client prices.
 */
export async function calculateCartTotals(items) {
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    if (item.type === 'catalog' && item.productId) {
      const med = await Medicine.findById(item.productId).select('name price packSize requiresRx category').lean();
      if (med) {
        const qty = Math.max(1, Number(item.qty || 1));
        const price = Number(med.price || 0);
        subtotal += price * qty;
        processedItems.push({
          type: 'catalog',
          productId: med._id,
          name: med.name,
          strength: med.packSize || '',
          category: med.category || '',
          qty,
          priceSnapshot: price,
          requiresRx: Boolean(med.requiresRx),
        });
      }
    } else if (item.type === 'prescription' || item.type === 'strip') {
      const qty = Math.max(1, Number(item.qty || 1));
      processedItems.push({
        type: item.type,
        productId: null,
        name: item.type === 'prescription' ? 'Prescription Order' : 'Medicine Strip Photo',
        imageUrl: item.imageUrl,
        note: item.note || '',
        qty,
        priceSnapshot: 0, // Unpriced until pharmacist review
        requiresRx: true,
      });
    }
  }

  // Tiered discount rules: 17% off on orders above 1500
  let discount = 0;
  if (subtotal >= 1500) {
    discount = Math.round(subtotal * 0.17);
  }

  // Free delivery above 1000, otherwise 25
  const deliveryFee = subtotal >= 1000 || subtotal === 0 ? 0 : 25;
  const platformFee = subtotal > 0 ? 5 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee + platformFee);

  return {
    processedItems,
    subtotal,
    discount,
    deliveryFee,
    platformFee,
    total,
  };
}

/**
 * Helper to get or create cart for user/phone
 */
async function resolveUserCart(req) {
  let userId = req.user?.id;
  let phone = req.user?.phone;

  if (!userId && req.query.phone) {
    const normalized = normalizePhone(req.query.phone);
    if (normalized) phone = normalized.e164;
  }

  if (!userId && phone) {
    const user = await User.findOne({ phone }).select('_id phone').lean();
    if (user) userId = user._id;
  }

  if (!userId) return null;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({
      userId,
      phone: phone || req.user?.phone || 'unknown',
      items: [],
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      platformFee: 0,
      total: 0,
    });
  }

  return cart;
}

/**
 * GET /cart
 * Return current active cart with server-validated totals
 */
export async function getCart(req, res) {
  try {
    const cart = await resolveUserCart(req);
    if (!cart) {
      return sendError(res, 'AUTH_REQUIRED', 'Please sign in or provide phone to access cart', 401);
    }

    // Always recompute totals server-side
    const { processedItems, subtotal, discount, deliveryFee, platformFee, total } =
      await calculateCartTotals(cart.items);

    cart.items = processedItems;
    cart.subtotal = subtotal;
    cart.discount = discount;
    cart.deliveryFee = deliveryFee;
    cart.platformFee = platformFee;
    cart.total = total;
    await cart.save();

    return sendSuccess(res, cart);
  } catch (err) {
    console.error('[getCart Error]', err);
    return sendError(res, 'SERVER_ERROR', err.message, 500);
  }
}

/**
 * PUT /cart/items
 * Add, update, or remove item from cart atomically
 * Body: { type, productId, imageUrl, note, qty }
 */
export async function updateCartItem(req, res) {
  try {
    const cart = await resolveUserCart(req);
    if (!cart) {
      return sendError(res, 'AUTH_REQUIRED', 'Please sign in or provide phone to update cart', 401);
    }

    const { type = 'catalog', productId, imageUrl, note = '', qty = 1 } = req.body;

    if (type === 'catalog') {
      if (!productId) {
        return sendError(res, 'MISSING_PRODUCT', 'productId is required for catalog items', 400);
      }

      const medicine = await Medicine.findById(productId).select('name price packSize requiresRx category').lean();
      if (!medicine) {
        return sendError(res, 'NOT_FOUND', 'Medicine not found in catalog', 404);
      }

      if (qty <= 0) {
        // Atomic pull to remove item
        await Cart.updateOne(
          { _id: cart._id },
          { $pull: { items: { productId: medicine._id } } }
        );
      } else {
        // Check if item exists in cart
        const existingIndex = cart.items.findIndex(
          (it) => it.productId && it.productId.toString() === productId.toString()
        );

        if (existingIndex > -1) {
          // Atomic update using arrayFilters
          await Cart.updateOne(
            { _id: cart._id, 'items.productId': medicine._id },
            {
              $set: {
                'items.$.qty': qty,
                'items.$.priceSnapshot': Number(medicine.price || 0),
              },
            }
          );
        } else {
          // Atomic push
          await Cart.updateOne(
            { _id: cart._id },
            {
              $push: {
                items: {
                  type: 'catalog',
                  productId: medicine._id,
                  name: medicine.name,
                  strength: medicine.packSize || '',
                  category: medicine.category || '',
                  qty,
                  priceSnapshot: Number(medicine.price || 0),
                  requiresRx: Boolean(medicine.requiresRx),
                },
              },
            }
          );
        }
      }
    } else {
      // Uploaded prescription or strip photo item
      if (!imageUrl) {
        return sendError(res, 'MISSING_IMAGE', 'imageUrl is required for prescription or strip items', 400);
      }

      if (qty <= 0) {
        await Cart.updateOne({ _id: cart._id }, { $pull: { items: { imageUrl } } });
      } else {
        const existingIndex = cart.items.findIndex((it) => it.imageUrl === imageUrl);
        if (existingIndex > -1) {
          await Cart.updateOne(
            { _id: cart._id, 'items.imageUrl': imageUrl },
            { $set: { 'items.$.qty': qty, 'items.$.note': note } }
          );
        } else {
          await Cart.updateOne(
            { _id: cart._id },
            {
              $push: {
                items: {
                  type,
                  productId: null,
                  name: type === 'prescription' ? 'Doctor Prescription' : 'Medicine Strip Photo',
                  imageUrl,
                  note,
                  qty,
                  priceSnapshot: 0,
                  requiresRx: true,
                },
              },
            }
          );
        }
      }
    }

    // Reload cart and recompute totals
    const updatedCart = await Cart.findById(cart._id);
    const totals = await calculateCartTotals(updatedCart.items);

    updatedCart.items = totals.processedItems;
    updatedCart.subtotal = totals.subtotal;
    updatedCart.discount = totals.discount;
    updatedCart.deliveryFee = totals.deliveryFee;
    updatedCart.platformFee = totals.platformFee;
    updatedCart.total = totals.total;
    await updatedCart.save();

    return sendSuccess(res, updatedCart, 'Cart updated successfully');
  } catch (err) {
    console.error('[updateCartItem Error]', err);
    return sendError(res, 'CART_UPDATE_FAILED', err.message, 500);
  }
}

/**
 * DELETE /cart
 * Clear all items from cart atomically
 */
export async function clearCart(req, res) {
  try {
    const cart = await resolveUserCart(req);
    if (!cart) {
      return sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.deliveryFee = 0;
    cart.platformFee = 0;
    cart.total = 0;
    await cart.save();

    return sendSuccess(res, cart, 'Cart cleared successfully');
  } catch (err) {
    return sendError(res, 'CLEAR_FAILED', err.message, 500);
  }
}
