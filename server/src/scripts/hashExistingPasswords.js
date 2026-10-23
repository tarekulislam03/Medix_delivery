import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';
import Rider from '../models/Rider.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medix_delivery';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB...');

  const defaultHash = await bcrypt.hash('123456', 10);

  // Update pharmacies without password
  const pharmaRes = await Pharmacy.updateMany(
    { $or: [{ password: '' }, { password: { $exists: false } }] },
    { $set: { password: defaultHash } }
  );
  console.log(`Updated ${pharmaRes.modifiedCount} pharmacies with default hashed password (123456)`);

  // Update riders without password
  const riderRes = await Rider.updateMany(
    { $or: [{ password: '' }, { password: { $exists: false } }] },
    { $set: { password: defaultHash } }
  );
  console.log(`Updated ${riderRes.modifiedCount} riders with default hashed password (123456)`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(console.error);
