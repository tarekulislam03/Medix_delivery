import React, { memo } from 'react';
import { Plus } from 'lucide-react';
import QtyStepper from './QtyStepper';
import { useT } from '../lib/i18n';

const SALT_LOOKUP = [
  { match: /dolo|calpol|pyrigesic|paracetamol|crocin|p\s*650|pacimol/i, salt: 'Paracetamol', pack: 'Strip of 15 tablets' },
  { match: /augmentin|clavam|moxikind\s*cv|amoxy/i, salt: 'Amoxycillin + Clavulanic Acid', pack: 'Strip of 10 tablets' },
  { match: /\bpan\s*d\b|pantocid\s*d|pantop\s*d|rabemac\s*dsr/i, salt: 'Pantoprazole + Domperidone', pack: 'Strip of 15 capsules' },
  { match: /\bpan\b|pantocid|pantop|pantodac|pantakind/i, salt: 'Pantoprazole Gastro-Resistant', pack: 'Strip of 15 tablets' },
  { match: /azithral|azee|azicip|zady/i, salt: 'Azithromycin Dihydrate', pack: 'Strip of 5 tablets' },
  { match: /telma|telmikind|telvas|tazloc/i, salt: 'Telmisartan', pack: 'Strip of 15 tablets' },
  { match: /shelcal|gemcal|cipcal|corcium/i, salt: 'Elemental Calcium + Vitamin D3', pack: 'Strip of 15 tablets' },
  { match: /thyronorm|eltroxin|thyrox/i, salt: 'Thyroxine Sodium', pack: 'Bottle of 120 tablets' },
  { match: /glycomet|gemer|glimy|glimestar|amaryl/i, salt: 'Glimepiride + Metformin SR', pack: 'Strip of 15 tablets' },
  { match: /liv\s*52/i, salt: 'Hepato-Protective Herbal Extract', pack: 'Pack of 100 tablets' },
  { match: /amlokind|stamlo|amlopres|cilacar/i, salt: 'Calcium Channel Blocker', pack: 'Strip of 15 tablets' },
  { match: /ecosprin/i, salt: 'Enteric Coated Aspirin', pack: 'Strip of 14 tablets' },
  { match: /montair|montemac|telekast|monticope/i, salt: 'Montelukast + Levocetirizine', pack: 'Strip of 15 tablets' },
  { match: /ascoril|alex|benadryl|grilinctus|tixylix|bro\s*zedex/i, salt: 'Bronchodilator & Mucolytic', pack: '100 ml bottle' },
  { match: /becosules|neurobion|supradyn|a\s*to\s*z/i, salt: 'B-Complex + Multivitamins', pack: 'Strip of 20 capsules' },
  { match: /zincovit|limcee|evion|celin/i, salt: 'Multivitamin & Mineral Supplement', pack: 'Strip of 15 tablets' },
  { match: /atorva|storvas|rosuvas|lipikind/i, salt: 'Atorvastatin Calcium', pack: 'Strip of 15 tablets' },
  { match: /allegra|cetirizine|okacet|cetzine|levocet/i, salt: 'Antihistamine Anti-Allergic', pack: 'Strip of 10 tablets' },
  { match: /combiflam|zerodol|meftal|flexon|nicip/i, salt: 'Ibuprofen + Paracetamol', pack: 'Strip of 20 tablets' },
  { match: /electral|ors|walyte/i, salt: 'WHO Oral Rehydration Salts', pack: '21.8 g sachet' },
  { match: /digene|gelusil|mucaine|cremaffin|alkasol/i, salt: 'Antacid & Digestive Relief', pack: '200 ml bottle' },
  { match: /volini|moov|omnigel|thrombophob/i, salt: 'Diclofenac Pain Relief Topical', pack: '30 g tube' },
  { match: /betadine|candid|surfaz|panderm|cosvate/i, salt: 'Topical Antimicrobial Formula', pack: '20 g tube' },
];

function deriveMedicineMeta(medicine) {
  const name = medicine.name || '';
  const cat = medicine.category || 'General Healthcare';

  const packMatch =
    name.match(/\((\d+\s*(?:Tab|Cap|Respule|Rotacap|Sachet)s?)\)/i) ||
    name.match(/\b(\d+\s*(?:Tab|Cap|Tablets|Capsules|ml|g|gm|kg|pcs|sachets))\b/i);

  for (const entry of SALT_LOOKUP) {
    if (entry.match.test(name)) {
      const explicitPack = packMatch
        ? packMatch[1]
            .replace(/\bTab\b/i, 'tablets')
            .replace(/\bCap\b/i, 'capsules')
        : entry.pack;
      return {
        salt: entry.salt,
        pack: explicitPack,
      };
    }
  }

  const strengthMatch = name.match(/\b(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)*\s*(?:mg|mcg|g|gm|ml|iu|%))\b/i);
  const strengthText = strengthMatch ? strengthMatch[1].toUpperCase() : '';

  if (cat === 'Syrups & Liquids' || /\b(syrup|suspension|liquid|solution|expectorant|emulsion)\b/i.test(name)) {
    return {
      salt: strengthText ? `Oral Liquid · ${strengthText}` : 'Oral Liquid Formulation',
      pack: packMatch ? packMatch[1] : '100 ml bottle',
    };
  }
  if (cat === 'Creams & Ointments' || /\b(cream|ointment|gel|lotion)\b/i.test(name)) {
    return {
      salt: strengthText ? `Topical Care · ${strengthText}` : 'Dermatological Care',
      pack: packMatch ? packMatch[1] : '20 g tube',
    };
  }
  if (cat === 'Eye & Ear Drops' || /\b(drops|drop)\b/i.test(name)) {
    return {
      salt: strengthText ? `Sterile Drops · ${strengthText}` : 'Sterile Drops Solution',
      pack: packMatch ? packMatch[1] : '15 ml dropper',
    };
  }
  if (cat === 'Capsules' || /\bcap\b/i.test(name)) {
    return {
      salt: strengthText ? `Active Strength ${strengthText}` : 'Oral Capsules',
      pack: packMatch ? packMatch[1].replace(/\bCap\b/i, 'capsules') : 'Strip of 10 capsules',
    };
  }

  return {
    salt: strengthText ? `Active Strength ${strengthText}` : 'Verified Pharmacy Essential',
    pack: packMatch ? packMatch[1].replace(/\bTab\b/i, 'tablets') : 'Strip of 15 tablets',
  };
}

const MedicineCard = memo(function MedicineCard({
  medicine,
  quantity = 0,
  onAdd,
  onIncrement,
  onDecrement,
}) {
  const t = useT();
  const mrp = Number(medicine.price) || 50;
  const discountedPrice = Math.max(1, Math.round(mrp * 0.88));
  const { salt, pack } = deriveMedicineMeta(medicine);

  return (
    <div className="bg-white rounded-[16px] p-4 select-none w-full">
      {/* Top Row: Medicine Name & Rx Badge */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display font-bold text-[16px] text-[#0E1A14] leading-snug tracking-[-0.02em] truncate">
          {medicine.name}
        </h4>

        {medicine.requiresRx && (
          <span className="shrink-0 px-2.5 py-0.5 rounded-[999px] bg-[#D64538]/12 text-[#D64538] text-[14px] font-bold tracking-tight">
            Rx
          </span>
        )}
      </div>

      {/* Generic Salt Name & Pack Size */}
      <p className="text-[14px] text-[#5E6B63] leading-snug mt-0.5 truncate">
        {salt} · {pack}
      </p>

      {/* Bottom Row: 20px Bold Price + Struck-through MRP + Lime 12% OFF Tag + ADD / Stepper */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
          <span className="font-display text-[20px] font-bold text-[#0E1A14] tracking-[-0.02em] tabular-nums leading-none">
            ₹{t.num(discountedPrice)}
          </span>
          <span className="text-[14px] font-medium text-[#5E6B63] line-through tabular-nums">
            ₹{t.num(Math.round(mrp))}
          </span>
          <span className="px-2 py-0.5 rounded-[999px] bg-[#C6F26B] text-[#0E1A14] text-[14px] font-bold tracking-tight leading-tight">
            12% OFF
          </span>
        </div>

        <div className="shrink-0">
          {quantity > 0 ? (
            <QtyStepper
              quantity={quantity}
              onIncrement={() => onIncrement(medicine.id)}
              onDecrement={() => onDecrement(medicine.id)}
            />
          ) : (
            <button
              type="button"
              onClick={() => onAdd(medicine)}
              className="min-h-[44px] px-4 bg-[#003820] text-white font-display text-[14px] font-bold tracking-[-0.01em] rounded-[999px] flex items-center justify-center gap-1 touch-manipulation cursor-pointer active:scale-[0.96] transition-transform duration-150"
              aria-label={`Add ${medicine.name} to cart`}
            >
              <Plus className="w-4 h-4 stroke-[2.6] text-[#C6F26B]" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default MedicineCard;
