import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Medicine from '../models/Medicine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medix_delivery';

// India's Top 20 Most Purchased Essential Medicines
export const TOP_20_INDIA_MEDICINES = [
  'Augmentin 625 Tab',
  'Pan 40mg Tab',
  'Calpol 650 15 Tab',
  'Dolo 650mg 15 Tab',
  'Azithral 500mg Tab (5 Tab)',
  'Telma 40mg Tab',
  'Shelcal 500mg Tab (15 Tab)',
  'Thyronorm 50',
  'Glycomet Gp1',
  'Liv 52 Tab',
  'Amlokind 5',
  'Ecosprin 75mg Tab (14 Tab)',
  'Montair LC',
  'Ascoril LS',
  'Becosules Cap',
  'Zincovit Tab',
  'Atorva 10',
  'Allegra 120',
  'Combiflam Tab',
  'Electral Powder',
];

const top20RankMap = {};
TOP_20_INDIA_MEDICINES.forEach((name, idx) => {
  top20RankMap[name.toLowerCase()] = idx + 1;
});

const POPULAR_KEYWORDS = [
  'paracetamol', 'pan 40', 'calpol', 'augmentin', 'dolo 650', 'azithral', 'amlokind',
  'telma', 'thyronorm', 'shelcal', 'pantocid', 'cetirizine', 'ecosprin', 'metformin',
  'atorvastatin', 'allegra', 'combiflam', 'alex syrup', 'candid cream', 'gelusil',
  'digene', 'montair', 'ascoril', 'zincovit', 'becosules', 'neurobion', 'glycomet',
  'clavam', 'moxikind', 'cilacar', 'rabemac', 'ofloxacin', 'cefixime', 'monocef',
  'benadryl', 'betadine', 'volini', 'moov', 'electral', 'ors', 'a to z', 'dexorange',
  'liv 52', 'cremaffin', 'cypon', 'duphaston', 'evion', 'limcee', 'glynase'
];

function parseCSV(content) {
  const clean = content.replace(/^\uFEFF/, '').trim();
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    if (cols.length >= 4) {
      const [id, name, mrpStr, category, sourcesStr] = cols;
      rows.push({
        id: id.trim(),
        name: name.trim(),
        mrp: parseFloat(mrpStr) || 50,
        category: (category || 'General Healthcare').trim(),
        sources: sourcesStr
          ? sourcesStr
              .replace(/"/g, '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });
    }
  }
  return rows;
}

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const csvPath = path.join(__dirname, '../data/final_medicines.csv');
    const jsonPath = path.join(__dirname, '../data/cleaned_medicines.json');

    console.log(`Reading medicine list from ${csvPath}...`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rawData = parseCSV(csvContent);
    console.log(`Parsed ${rawData.length} medicines from final_medicines.csv.`);

    // Prepare documents
    const docs = rawData.map((item) => {
      const lower = item.name.toLowerCase();
      const rank = top20RankMap[lower];
      const isTop20 = Boolean(rank);
      const isPopular = isTop20 || POPULAR_KEYWORDS.some((kw) => lower.includes(kw));

      // Extract dosage/strength from name if present
      let strength = item.category;
      const match = item.name.match(/\b(\d+(?:\.\d+)?(?:mg|ml|gm|g|mcg|iu|%))\b/i);
      if (match) {
        strength = `${match[0].toUpperCase()} · ${item.category}`;
      }

      const slugBase = item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      return {
        name: item.name,
        slug: `${slugBase}-${item.id}`,
        price: item.mrp && item.mrp > 0 ? item.mrp : 50,
        category: item.category,
        strength: strength,
        popular: isPopular,
        trendingRank: rank || 9999,
        requiresRx: ['Tablets', 'Capsules', 'Injections', 'Inhalers & Sprays'].includes(item.category),
        sources: item.sources || [],
        rawVariants: [item.name],
      };
    });

    // Save JSON backup in sync
    fs.writeFileSync(jsonPath, JSON.stringify(docs, null, 2), 'utf-8');
    console.log(`Updated JSON snapshot at ${jsonPath}.`);

    console.log('Clearing existing medicines in MongoDB collection...');
    await Medicine.deleteMany({});

    console.log(`Inserting ${docs.length} medicines into MongoDB collection...`);
    const chunkSize = 1000;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      await Medicine.insertMany(chunk, { ordered: false });
      console.log(`Inserted chunk ${i + 1} - ${Math.min(i + chunkSize, docs.length)}`);
    }

    const count = await Medicine.countDocuments();
    const top20Count = await Medicine.countDocuments({ trendingRank: { $lte: 20 } });
    console.log(`Successfully seeded ${count} medicines from final_medicines.csv!`);
    console.log(`(${top20Count} top India trending medicines assigned ranks 1-20)`);

    await mongoose.disconnect();
    console.log('Finished seeding successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
