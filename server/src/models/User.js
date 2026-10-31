import mongoose from 'mongoose';

const addressSubSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    villagePo: { type: String, required: true, trim: true },
    landmark: { type: String, default: '', trim: true },
    pinCode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [88.3639, 22.5726] }, // [lng, lat]
    },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['customer', 'pharmacy', 'rider', 'admin'],
      default: 'customer',
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      required: true,
      unique: true,
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
    isNewUser: {
      type: Boolean,
      default: true,
    },
    hasSeenWelcome: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    savedAddresses: [addressSubSchema],
    defaultAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Retain legacy store/rider fields for panel compatibility
    storeName: { type: String, default: '' },
    vehicleNumber: { type: String, default: '' },
    area: { type: String, default: '' },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: true },
    acceptingOrders: { type: Boolean, default: true },
    pharmacyRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', default: null },
    riderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
    fcmToken: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ phone: 1, role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
