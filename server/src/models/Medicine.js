import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    strength: {
      type: String,
      default: '',
    },
    popular: {
      type: Boolean,
      default: false,
      index: true,
    },
    trendingRank: {
      type: Number,
      default: 9999,
      index: true,
    },
    requiresRx: {
      type: Boolean,
      default: false,
    },
    sources: [{
      type: String,
    }],
    rawVariants: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast search queries
medicineSchema.index({ name: 'text', category: 'text' });
medicineSchema.index({ category: 1, popular: -1 });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
