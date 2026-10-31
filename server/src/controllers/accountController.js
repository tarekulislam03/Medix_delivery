import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /me
 * Return authenticated customer profile
 */
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      'phone name role savedAddresses defaultAddressId isNewUser hasSeenWelcome createdAt lastLoginAt'
    ).lean();

    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User profile not found', 404);
    }

    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, 'SERVER_ERROR', err.message, 500);
  }
}

/**
 * PATCH /me
 * Update customer profile details (name, hasSeenWelcome)
 */
export async function updateProfile(req, res) {
  try {
    const updates = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
    if (typeof req.body.hasSeenWelcome === 'boolean') updates.hasSeenWelcome = req.body.hasSeenWelcome;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('phone name role savedAddresses defaultAddressId isNewUser hasSeenWelcome createdAt lastLoginAt').lean();

    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (err) {
    return sendError(res, 'UPDATE_FAILED', err.message, 500);
  }
}

/**
 * GET /me/addresses
 * List all saved customer addresses
 */
export async function getAddresses(req, res) {
  try {
    const user = await User.findById(req.user.id).select('savedAddresses defaultAddressId').lean();
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    return sendSuccess(res, {
      addresses: user.savedAddresses || [],
      defaultAddressId: user.defaultAddressId,
    });
  } catch (err) {
    return sendError(res, 'SERVER_ERROR', err.message, 500);
  }
}

/**
 * POST /me/addresses
 * Add a new saved address
 */
export async function addAddress(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const newAddress = {
      label: req.body.label || 'Home',
      fullName: req.body.fullName,
      phone: req.body.phone || req.user?.phone || user.phone,
      villagePo: req.body.villagePo,
      landmark: req.body.landmark || '',
      pinCode: req.body.pinCode,
      isDefault: Boolean(req.body.isDefault) || user.savedAddresses.length === 0,
      geo: req.body.geo || undefined,
    };

    user.savedAddresses.push(newAddress);
    const added = user.savedAddresses[user.savedAddresses.length - 1];

    if (newAddress.isDefault || !user.defaultAddressId) {
      user.defaultAddressId = added._id;
      user.savedAddresses.forEach((addr) => {
        if (!addr._id.equals(added._id)) addr.isDefault = false;
      });
    }

    await user.save();

    return sendSuccess(res, {
      address: added,
      defaultAddressId: user.defaultAddressId,
    }, 'Address saved successfully', 201);
  } catch (err) {
    return sendError(res, 'SAVE_ADDRESS_FAILED', err.message, 500);
  }
}

/**
 * PATCH /me/addresses/:addressId
 * Update an existing address
 */
export async function updateAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const addr = user.savedAddresses.id(addressId);
    if (!addr) {
      return sendError(res, 'ADDRESS_NOT_FOUND', 'Address not found', 404);
    }

    Object.assign(addr, req.body);

    if (req.body.isDefault) {
      user.defaultAddressId = addr._id;
      user.savedAddresses.forEach((a) => {
        if (!a._id.equals(addr._id)) a.isDefault = false;
      });
    }

    await user.save();

    return sendSuccess(res, {
      address: addr,
      defaultAddressId: user.defaultAddressId,
    }, 'Address updated successfully');
  } catch (err) {
    return sendError(res, 'UPDATE_ADDRESS_FAILED', err.message, 500);
  }
}

/**
 * DELETE /me/addresses/:addressId
 * Delete a saved address
 */
export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const addr = user.savedAddresses.id(addressId);
    if (!addr) {
      return sendError(res, 'ADDRESS_NOT_FOUND', 'Address not found', 404);
    }

    addr.deleteOne();

    if (user.defaultAddressId && user.defaultAddressId.toString() === addressId) {
      user.defaultAddressId = user.savedAddresses.length > 0 ? user.savedAddresses[0]._id : null;
      if (user.defaultAddressId && user.savedAddresses.length > 0) {
        user.savedAddresses[0].isDefault = true;
      }
    }

    await user.save();

    return sendSuccess(res, {
      remainingCount: user.savedAddresses.length,
      defaultAddressId: user.defaultAddressId,
    }, 'Address removed successfully');
  } catch (err) {
    return sendError(res, 'DELETE_ADDRESS_FAILED', err.message, 500);
  }
}

/**
 * POST /me/addresses/:addressId/default
 * Set address as default
 */
export async function setDefaultAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const addr = user.savedAddresses.id(addressId);
    if (!addr) {
      return sendError(res, 'ADDRESS_NOT_FOUND', 'Address not found', 404);
    }

    user.defaultAddressId = addr._id;
    user.savedAddresses.forEach((a) => {
      a.isDefault = a._id.equals(addr._id);
    });

    await user.save();

    return sendSuccess(res, {
      defaultAddressId: user.defaultAddressId,
    }, 'Default delivery address updated');
  } catch (err) {
    return sendError(res, 'SET_DEFAULT_FAILED', err.message, 500);
  }
}
