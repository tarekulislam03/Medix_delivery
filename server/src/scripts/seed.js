import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { hashValue } from '../utils/token.js';
import { normalizePhone } from '../utils/phone.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medix_delivery';

const SAMPLE_MEDICINES = [
  {
    name: 'Augmentin 625 Duo Tablet',
    slug: 'augmentin-625-duo-tablet',
    price: 201.5,
    category: 'Antibiotics',
    strength: '625mg',
    popular: true,
    trendingRank: 1,
    requiresRx: true,
    sources: ['GSK Pharmaceuticals'],
    rawVariants: ['Strip of 10 tablets'],
  },
  {
    name: 'Pan 40 Tablet',
    slug: 'pan-40-tablet',
    price: 155.0,
    category: 'Gastrointestinal',
    strength: '40mg',
    popular: true,
    trendingRank: 2,
    requiresRx: false,
    sources: ['Alkem Laboratories'],
    rawVariants: ['Strip of 15 tablets'],
  },
  {
    name: 'Calpol 650 Tablet',
    slug: 'calpol-650-tablet',
    price: 33.5,
    category: 'Pain Relief & Fever',
    strength: '650mg',
    popular: true,
    trendingRank: 3,
    requiresRx: false,
    sources: ['GlaxoSmithKline'],
    rawVariants: ['Strip of 15 tablets'],
  },
  {
    name: 'Dolo 650 Tablet',
    slug: 'dolo-650-tablet',
    price: 34.0,
    category: 'Pain Relief & Fever',
    strength: '650mg',
    popular: true,
    trendingRank: 4,
    requiresRx: false,
    sources: ['Micro Labs Ltd'],
    rawVariants: ['Strip of 15 tablets'],
  },
  {
    name: 'Azithral 500 Tablet',
    slug: 'azithral-500-tablet',
    price: 119.0,
    category: 'Antibiotics',
    strength: '500mg',
    popular: true,
    trendingRank: 5,
    requiresRx: true,
    sources: ['Alembic Pharmaceuticals'],
    rawVariants: ['Strip of 5 tablets'],
  },
  {
    name: 'Telma 40 Tablet',
    slug: 'telma-40-tablet',
    price: 220.0,
    category: 'Cardiac & Blood Pressure',
    strength: '40mg',
    popular: true,
    trendingRank: 6,
    requiresRx: true,
    sources: ['Glenmark Pharmaceuticals'],
    rawVariants: ['Strip of 30 tablets'],
  },
  {
    name: 'Shelcal 500 Tablet',
    slug: 'shelcal-500-tablet',
    price: 131.0,
    category: 'Vitamins & Supplements',
    strength: '500mg',
    popular: true,
    trendingRank: 7,
    requiresRx: false,
    sources: ['Torrent Pharmaceuticals'],
    rawVariants: ['Strip of 15 tablets'],
  },
  {
    name: 'Thyronorm 50mcg Tablet',
    slug: 'thyronorm-50mcg-tablet',
    price: 185.0,
    category: 'Thyroid Care',
    strength: '50mcg',
    popular: true,
    trendingRank: 8,
    requiresRx: true,
    sources: ['Abbott Healthcare'],
    rawVariants: ['Bottle of 120 tablets'],
  },
  {
    name: 'Electral Powder 21.8gm',
    slug: 'electral-powder-21-8gm',
    price: 21.5,
    category: 'First Aid & Rehydration',
    strength: '21.8g Sachet',
    popular: true,
    trendingRank: 9,
    requiresRx: false,
    sources: ['FDC Ltd'],
    rawVariants: ['Sachet'],
  },
  {
    name: 'Zincovit Tablet',
    slug: 'zincovit-tablet',
    price: 110.0,
    category: 'Vitamins & Supplements',
    strength: 'Multivitamin',
    popular: true,
    trendingRank: 10,
    requiresRx: false,
    sources: ['Apex Laboratories'],
    rawVariants: ['Strip of 15 tablets'],
  },
];

async function seed() {
  console.log('--- Starting Medix Production Database Seed ---');
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB at ${MONGO_URI}`);

    // 1. Seed Essential Medicines
    console.log('Seeding essential medicines catalog...');
    for (const med of SAMPLE_MEDICINES) {
      await Medicine.findOneAndUpdate(
        { slug: med.slug },
        { $set: med },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${SAMPLE_MEDICINES.length} essential medicines.`);

    // 2. Seed Admin User
    const adminPhoneNorm = normalizePhone(process.env.ADMIN_PHONE || '9876543210');
    const adminPhone = adminPhoneNorm ? adminPhoneNorm.e164 : '+919876543210';
    const hashedAdminPassword = await hashValue(process.env.ADMIN_PASSWORD || 'MedixAdmin@2026');

    const adminUser = await User.findOneAndUpdate(
      { phone: adminPhone },
      {
        $set: {
          phone: adminPhone,
          name: 'Medix Head Pharmacist',
          role: 'admin',
          password: hashedAdminPassword,
          isVerified: true,
          isNewUser: false,
          hasSeenWelcome: true,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Admin user seeded: Phone ${adminUser.phone}, Role: ${adminUser.role}`);

    // 3. Seed Demo Customer with Rural Address
    const customerPhoneNorm = normalizePhone('9800000001');
    const customerPhone = customerPhoneNorm ? customerPhoneNorm.e164 : '+919800000001';
    const customer = await User.findOneAndUpdate(
      { phone: customerPhone },
      {
        $set: {
          phone: customerPhone,
          name: 'Ramesh Mondal',
          role: 'customer',
          isVerified: true,
          isNewUser: false,
          hasSeenWelcome: true,
          savedAddresses: [
            {
              label: 'Home',
              fullName: 'Ramesh Mondal',
              phone: customerPhone,
              villagePo: 'Kalinagar Village, Near Primary School',
              landmark: 'Opposite Shani Mandir',
              pinCode: '743442',
              isDefault: true,
              geo: {
                type: 'Point',
                coordinates: [88.8542, 22.3841],
              },
            },
          ],
        },
      },
      { upsert: true, new: true }
    );

    // Set defaultAddressId to the saved address
    if (customer.savedAddresses && customer.savedAddresses.length > 0) {
      customer.defaultAddressId = customer.savedAddresses[0]._id;
      await customer.save();
    }
    console.log(`Customer user seeded: Phone ${customer.phone}, ID: ${customer._id}`);

    // 4. Seed Cart for Demo Customer
    const sampleMed = await Medicine.findOne({ slug: 'calpol-650-tablet' });
    if (sampleMed) {
      await Cart.findOneAndUpdate(
        { userId: customer._id },
        {
          $set: {
            phone: customer.phone,
            items: [
              {
                itemType: 'catalog',
                productId: sampleMed._id,
                name: sampleMed.name,
                price: sampleMed.price,
                quantity: 2,
                image: '',
              },
            ],
            bill: {
              itemsTotal: sampleMed.price * 2,
              deliveryCharge: 0,
              packagingCharge: 5,
              discount: 0,
              total: sampleMed.price * 2 + 5,
            },
          },
        },
        { upsert: true }
      );
      console.log('Sample cart seeded for customer.');
    }

    console.log('--- Database seeding completed successfully! ---');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
