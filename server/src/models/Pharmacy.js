import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    acceptingOrders: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

pharmacySchema.index({ location: '2dsphere' });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
