import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['catalog', 'prescription', 'strip'],
      default: 'catalog',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
    },
    name: {
      type: String,
      default: '',
    },
    strength: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    priceSnapshot: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: '',
    },
    requiresRx: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 25,
    },
    platformFee: {
      type: Number,
      default: 5,
    },
    total: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
