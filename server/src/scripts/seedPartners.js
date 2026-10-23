import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Pharmacy from '../models/Pharmacy.js';
import Rider from '../models/Rider.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medix_delivery';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding partners...');

  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  const pharmacyCount = await Pharmacy.countDocuments();
  if (pharmacyCount === 0) {
    await Pharmacy.create([
      {
        name: 'Apollo Pharmacy - Dankuni',
        phone: '9830112233',
        password: defaultPasswordHash,
        address: 'Station Road, Dankuni, Hooghly',
        area: 'Dankuni',
        isOpen: true,
        acceptingOrders: true,
      },
      {
        name: 'MedPlus - Chanditala',
        phone: '9830445566',
        password: defaultPasswordHash,
        address: 'Old Court Road, Chanditala',
        area: 'Chanditala',
        isOpen: true,
        acceptingOrders: true,
      },
      {
        name: 'Care Chemist & Druggist',
        phone: '9830778899',
        password: defaultPasswordHash,
        address: 'Nawabpur Main Market, Hooghly - 712701',
        area: 'Nawabpur',
        isOpen: true,
        acceptingOrders: true,
      },
    ]);
    console.log('Seeded 3 default partner pharmacies with hashed password 123456');
  }

  const riderCount = await Rider.countDocuments();
  if (riderCount === 0) {
    await Rider.create([
      {
        name: 'Rahul Sen (Rider 1)',
        phone: '9876500001',
        password: defaultPasswordHash,
        vehicleNumber: 'WB-16-AB-1234',
        isActive: true,
        isAvailable: true,
      },
      {
        name: 'Amit Ghosh (Rider 2)',
        phone: '9876500002',
        password: defaultPasswordHash,
        vehicleNumber: 'WB-16-CD-5678',
        isActive: true,
        isAvailable: true,
      },
    ]);
    console.log('Seeded 2 default delivery riders with hashed password 123456');
  }

  await mongoose.disconnect();
  console.log('Seeding finished.');
}

seed().catch(console.error);
