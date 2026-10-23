import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    price: Number,
    estimatedTime: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      default: 'Customer',
    },
    items: [
      {
        id: String,
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        requiresRx: { type: Boolean, default: false },
        price: { type: Number, required: true },
        strength: { type: String, default: '' },
        category: { type: String, default: '' },
      },
    ],
    address: {
      fullName: { type: String, default: '' },
      villagePo: { type: String, default: '' },
      pinCode: { type: String, default: '' },
      landmark: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    pharmacy: {
      name: { type: String, default: 'Nearest Verified Chemist' },
      address: { type: String, default: 'Siliguri' },
      phone: { type: String, default: '' },
    },
    rider: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      vehicleNumber: { type: String, default: null },
    },
    paymentMethod: {
      type: String,
      default: 'COD',
    },
    bill: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      delivery: { type: Number, default: 0 },
      platform: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: [
        'SEARCHING',
        'PLACED',
        'CONFIRMED',
        'PACKED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'SEARCHING',
      index: true,
    },
    eta: {
      type: String,
      default: 'within 24 hrs',
    },
    prescriptionUploaded: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    pickupOtp: {
      type: String,
      default: '',
    },
    deliveryOtp: {
      type: String,
      default: '',
    },
    offers: [offerSchema],
    placedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
