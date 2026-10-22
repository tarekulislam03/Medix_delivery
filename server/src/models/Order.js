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
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        prescriptionRequired: { type: Boolean, default: false },
        price: Number,
      },
    ],
    address: {
      street: String,
      city: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],
      },
    },
    status: {
      type: String,
      enum: [
        'pending',
        'placed',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    offers: [offerSchema],
    fees: {
      deliveryFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
