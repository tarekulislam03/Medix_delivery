import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['catalog', 'prescription', 'strip'],
      default: 'catalog',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    strength: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isPriced: {
      type: Boolean,
      default: true,
    },
    requiresRx: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    actor: {
      type: String,
      default: 'system', // 'system' | 'customer' | 'admin' | 'rider' | 'pharmacy'
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
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
    orderType: {
      type: String,
      enum: ['catalog', 'prescription', 'strip', 'mixed'],
      default: 'catalog',
    },
    items: [orderItemSchema],
    address: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      villagePo: { type: String, default: '' },
      pinCode: { type: String, default: '' },
      landmark: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    bill: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      delivery: { type: Number, default: 25 },
      platform: { type: Number, default: 5 },
      total: { type: Number, default: 30 },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'COD', 'upi', 'UPI'],
      default: 'cod',
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
        'REJECTED',
        'AWAITING_CUSTOMER_CONFIRMATION',
      ],
      default: 'PLACED',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    eta: {
      type: String,
      default: '20 mins',
    },
    deliveryOtp: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: null,
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
    prescriptionUploaded: {
      type: Boolean,
      default: false,
    },
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

// Compound indexes per spec:
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
