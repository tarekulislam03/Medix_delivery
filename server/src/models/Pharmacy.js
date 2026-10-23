import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    address: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      default: '',
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    acceptingOrders: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
