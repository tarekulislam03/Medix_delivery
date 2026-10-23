import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['customer', 'pharmacy', 'rider', 'admin'],
      default: 'customer',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    storeName: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    area: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    acceptingOrders: {
      type: Boolean,
      default: true,
    },
    pharmacyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      default: null,
    },
    riderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
      default: null,
    },
    address: {
      fullName: { type: String, default: '' },
      villagePo: { type: String, default: '' },
      pinCode: { type: String, default: '' },
      landmark: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    cart: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        requiresRx: { type: Boolean, default: false },
        strength: { type: String, default: '' },
        category: { type: String, default: '' },
      },
    ],
    fcmToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ phone: 1, role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
