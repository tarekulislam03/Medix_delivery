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
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      fullName: { type: String, default: '' },
      villagePo: { type: String, default: '' },
      pinCode: { type: String, default: '' },
      landmark: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    fcmToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
