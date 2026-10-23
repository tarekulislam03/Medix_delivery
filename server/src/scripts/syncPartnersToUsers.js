import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';
import Rider from '../models/Rider.js';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medix_delivery';

async function syncPartnersToUsers() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for syncing partners into users table...');

  const pharmacies = await Pharmacy.find();
  console.log(`Found ${pharmacies.length} pharmacies in Pharmacy collection.`);

  for (const p of pharmacies) {
    const cleanPhone = String(p.phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone) continue;

    const user = await User.findOneAndUpdate(
      { phone: cleanPhone, role: 'pharmacy' },
      {
        name: p.name,
        phone: cleanPhone,
        role: 'pharmacy',
        password: p.password || '',
        storeName: p.name,
        area: p.area || '',
        notes: p.notes || '',
        isOpen: p.isOpen !== false,
        acceptingOrders: p.acceptingOrders !== false,
        pharmacyRef: p._id,
        address: {
          fullName: p.name,
          fullAddress: p.address || '',
          villagePo: p.area || '',
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Synced pharmacy "${p.name}" (${cleanPhone}) to users collection with ID ${user._id}`);
  }

  const riders = await Rider.find();
  console.log(`Found ${riders.length} riders in Rider collection.`);

  for (const r of riders) {
    const cleanPhone = String(r.phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone) continue;

    const user = await User.findOneAndUpdate(
      { phone: cleanPhone, role: 'rider' },
      {
        name: r.name,
        phone: cleanPhone,
        role: 'rider',
        password: r.password || '',
        vehicleNumber: r.vehicleNumber || '',
        notes: r.notes || '',
        isActive: r.isActive !== false,
        isAvailable: r.isAvailable !== false,
        riderRef: r._id,
      },
      { upsert: true, new: true }
    );
    console.log(`Synced rider "${r.name}" (${cleanPhone}) to users collection with ID ${user._id}`);
  }

  const allUsers = await User.find({}, { name: 1, phone: 1, role: 1 });
  console.log('All users in users collection now:');
  console.log(allUsers);

  await mongoose.disconnect();
  console.log('Sync finished successfully.');
}

syncPartnersToUsers().catch(console.error);
