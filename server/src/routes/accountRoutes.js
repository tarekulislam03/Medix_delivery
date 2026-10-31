import express from 'express';
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/accountController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
} from '../validation/accountSchemas.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getProfile);
router.patch('/', validate(updateProfileSchema), updateProfile);

router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressSchema), addAddress);
router.patch('/addresses/:addressId', validate(updateAddressSchema), updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.post('/addresses/:addressId/default', setDefaultAddress);

export default router;
