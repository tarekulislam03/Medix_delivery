/**
 * Realistic mock data for Medix OrdersPage and AccountPage preview & fallback.
 */

export const PHARMACY_LICENCE_NO = 'DL-WB/SLG/20B-48921';

export const MOCK_ACTIVE_ORDERS = [
  {
    id: 'MDX-4829',
    status: 'OUT_FOR_DELIVERY',
    etaMinutes: 14,
    placedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    requiresRx: true,
    rxVerified: true,
    deliveryOtp: '4829',
    statusNote: "Your order is packed. Rahul's on the way.",
    paymentMethod: 'Cash on Delivery',
    address: 'Nababpur Paschim para, Near Kali Mandir, PIN 712706',
    pharmacy: {
      name: 'MedPlus Wellness Pharmacy',
      address: 'Station Feeder Road, Siliguri',
      licence: PHARMACY_LICENCE_NO,
    },
    rider: {
      name: 'Rahul Roy',
      rating: '4.9',
      phone: '+918918237582',
      vehicle: 'WB-74-AK-1920',
    },
    timestamps: {
      PLACED: '7:42 PM',
      RX_REVIEW: '7:44 PM',
      CONFIRMED: '7:45 PM',
      PACKED: '7:49 PM',
      OUT_FOR_DELIVERY: '7:52 PM',
      DELIVERED: '',
    },
    items: [
      { id: 'dolo-650', name: 'Dolo 650mg Strip of 15 Tablets', quantity: 2, price: 30, requiresRx: false },
      { id: 'augmentin-625', name: 'Augmentin 625 Duo Strip of 10 Tablets', quantity: 1, price: 201, requiresRx: true },
      { id: 'pan-d', name: 'Pan-D Strip of 15 Capsules', quantity: 1, price: 190, requiresRx: false },
      { id: 'electral', name: 'Electral WHO ORS Powder Sachet 21.8g', quantity: 3, price: 22, requiresRx: false },
    ],
    bill: {
      subtotal: 517,
      discount: 62,
      discountPct: 12,
      delivery: 18,
      platform: 4,
      total: 477,
    },
  },
  {
    id: 'MDX-4834',
    status: 'CONFIRMED',
    etaMinutes: 20,
    placedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    requiresRx: true,
    rxUnderReview: true,
    deliveryOtp: '9104',
    statusNote: 'Pharmacist is verifying your uploaded prescription.',
    paymentMethod: 'Cash on Delivery',
    address: 'Nababpur Paschim para, Near Kali Mandir, PIN 712706',
    pharmacy: {
      name: 'Apollo Life Care Chemist',
      address: 'Hill Cart Road, Siliguri',
      licence: 'DL-WB/SLG/20B-33108',
    },
    rider: {
      name: 'Suman Das',
      rating: '4.8',
      phone: '+918918237582',
    },
    timestamps: {
      PLACED: '7:56 PM',
      RX_REVIEW: 'In review',
      CONFIRMED: '',
      PACKED: '',
      OUT_FOR_DELIVERY: '',
      DELIVERED: '',
    },
    items: [
      { id: 'azithral-500', name: 'Azithral 500mg Strip of 5 Tablets', quantity: 2, price: 119, requiresRx: true },
      { id: 'ascoril-ls', name: 'Ascoril LS Syrup 100ml Bottle', quantity: 1, price: 118, requiresRx: false },
    ],
    bill: {
      subtotal: 356,
      discount: 0,
      discountPct: 0,
      delivery: 18,
      platform: 4,
      total: 378,
    },
  },
];

export const MOCK_PAST_ORDERS = [
  {
    id: 'MDX-4712',
    status: 'DELIVERED',
    placedAt: '2026-10-21T18:30:00.000Z',
    monthGroup: 'OCTOBER 2026',
    paymentMethod: 'Cash on Delivery',
    address: 'Nababpur Paschim para, Near Kali Mandir, PIN 712706',
    pharmacy: {
      name: 'MedPlus Wellness Pharmacy',
      address: 'Station Feeder Road',
      licence: PHARMACY_LICENCE_NO,
    },
    rider: {
      name: 'Rahul Roy',
      rating: '4.9',
      phone: '+918918237582',
    },
    timestamps: {
      PLACED: '6:30 PM',
      CONFIRMED: '6:32 PM',
      PACKED: '6:36 PM',
      OUT_FOR_DELIVERY: '6:39 PM',
      DELIVERED: '6:48 PM',
    },
    items: [
      { id: 'telma-40', name: 'Telma 40mg Strip of 15 Tablets', quantity: 2, price: 220, kind: 'strip' },
      { id: 'shelcal-500', name: 'Shelcal 500mg Strip of 15 Tablets', quantity: 2, price: 131, kind: 'strip' },
      { id: 'ecosprin-75', name: 'Ecosprin 75mg Strip of 14 Tablets', quantity: 3, price: 15, kind: 'strip' },
      { id: 'zincovit', name: 'Zincovit Strip of 15 Tablets', quantity: 1, price: 110, kind: 'bottle' },
      { id: 'volini-gel', name: 'Volini Pain Relief Gel 30g Tube', quantity: 1, price: 130, kind: 'tube' },
    ],
    bill: {
      subtotal: 987,
      discount: 118,
      discountPct: 12,
      delivery: 18,
      platform: 4,
      total: 891,
    },
  },
  {
    id: 'MDX-4655',
    status: 'DELIVERED',
    placedAt: '2026-10-08T10:15:00.000Z',
    monthGroup: 'OCTOBER 2026',
    paymentMethod: 'Cash on Delivery',
    address: 'Nababpur Paschim para, Near Kali Mandir, PIN 712706',
    pharmacy: {
      name: 'Frank Ross Pharmacy',
      address: 'Sevoke Road',
      licence: 'DL-WB/SLG/20B-11904',
    },
    timestamps: {
      PLACED: '10:15 AM',
      CONFIRMED: '10:17 AM',
      PACKED: '10:21 AM',
      OUT_FOR_DELIVERY: '10:24 AM',
      DELIVERED: '10:34 AM',
    },
    items: [
      { id: 'pan-40', name: 'Pan 40mg Strip of 15 Tablets', quantity: 2, price: 155, kind: 'strip' },
      { id: 'digene-syrup', name: 'Digene Mint Flavour Gel 200ml', quantity: 1, price: 145, kind: 'bottle' },
      { id: 'becosules', name: 'Becosules Strip of 20 Capsules', quantity: 2, price: 55, kind: 'strip' },
    ],
    bill: {
      subtotal: 565,
      discount: 68,
      discountPct: 12,
      delivery: 18,
      platform: 4,
      total: 519,
    },
  },
  {
    id: 'MDX-4501',
    status: 'CANCELLED',
    placedAt: '2026-09-24T20:05:00.000Z',
    monthGroup: 'SEPTEMBER 2026',
    paymentMethod: 'Cash on Delivery',
    address: 'Nababpur Paschim para, Near Kali Mandir, PIN 712706',
    pharmacy: {
      name: 'MedPlus Wellness Pharmacy',
      address: 'Station Feeder Road',
      licence: PHARMACY_LICENCE_NO,
    },
    timestamps: {
      PLACED: '8:05 PM',
      CONFIRMED: 'Cancelled at 8:07 PM',
    },
    items: [
      { id: 'montair-lc', name: 'Montair LC Strip of 15 Tablets', quantity: 1, price: 210, kind: 'strip' },
      { id: 'allegra-120', name: 'Allegra 120mg Strip of 10 Tablets', quantity: 1, price: 218, kind: 'strip' },
    ],
    bill: {
      subtotal: 428,
      discount: 0,
      discountPct: 0,
      delivery: 18,
      platform: 4,
      total: 450,
    },
  },
];

export const MOCK_SAVED_ADDRESSES = [
  {
    id: 'addr-home',
    tag: 'Home',
    isDefault: true,
    fullName: 'Tarekul Islam',
    villagePo: 'Nababpur Paschim para',
    landmark: 'Near Kali Mandir',
    pinCode: '712706',
  },
  {
    id: 'addr-work',
    tag: 'Work',
    isDefault: false,
    fullName: 'Tarekul Islam',
    villagePo: 'Station Feeder Road, Ward 18',
    landmark: 'Opposite City Center Gate 2',
    pinCode: '734001',
  },
];

export const MOCK_PRESCRIPTIONS = [
  {
    id: 'RX-902',
    doctor: 'Dr. A. K. Sengupta (MD, General Medicine)',
    uploadedOn: '14 Oct 2026',
    validUntil: '14 Jan 2027',
    status: 'Verified',
    medicines: ['Augmentin 625 Duo', 'Pan-D Capsules'],
  },
  {
    id: 'RX-841',
    doctor: 'Dr. S. Chatterjee (Cardiology)',
    uploadedOn: '02 Jul 2026',
    validUntil: '02 Oct 2026',
    status: 'Expired',
    medicines: ['Telma 40mg', 'Ecosprin 75mg'],
  },
];

export const MOCK_FAQS = [
  {
    q: 'How fast does medix. deliver?',
    a: 'Most orders are confirmed within 2 minutes by a partner pharmacy near you and delivered in 15 to 25 minutes.',
  },
  {
    q: 'How does the 12% and 17% discount work?',
    a: 'Orders from ₹500 automatically get 12% off. Orders above ₹1,500 get 17% off plus 70% off delivery.',
  },
  {
    q: 'When is a prescription required?',
    a: 'Schedule H and H1 medicines (marked with the red Rx tag) are verified by our licensed pharmacist before dispatch.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Yes, you can cancel any active order directly from the order card before the pharmacy marks it as Packed.',
  },
];
