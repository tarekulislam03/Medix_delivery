let mockOrdersStore = [
  {
    id: 'MD1042',
    placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    status: 'OUT_FOR_DELIVERY',
    eta: 'Arriving in about 25 min',
    pharmacy: {
      name: 'Apollo Pharmacy, Sevoke Rd',
      address: 'Sevoke Road, Siliguri',
    },
    rider: {
      name: 'Rahul Sharma',
      phone: '+919800012345',
    },
    items: [
      { id: 'med-1', name: 'Paracetamol', strength: '500mg, 10 tablets', quantity: 2, price: 32 },
      { id: 'med-5', name: 'Pantoprazole DSR', strength: '40mg/30mg, 10 capsules', quantity: 1, price: 115 },
      { id: 'med-17', name: 'Vitamin D3 Calcirol', strength: '60,000 IU, 4 capsules', quantity: 2, price: 198 },
    ],
    address: 'Home, Siliguri',
    paymentMethod: 'UPI',
    bill: {
      subtotal: 575,
      delivery: 14,
      platform: 4,
      total: 593,
    },
  },
  {
    id: 'MD1040',
    placedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    status: 'SEARCHING',
    eta: null,
    pharmacy: null,
    rider: null,
    items: [
      { id: 'med-3', name: 'Telmisartan', strength: '40mg, 15 tablets', quantity: 3, price: 88, requiresRx: true },
      { id: 'med-18', name: 'Neurobion Forte', strength: 'B-Complex + B12, 30 tablets', quantity: 4, price: 42 },
      { id: 'med-6', name: 'Cetirizine HCl', strength: '10mg, 10 tablets', quantity: 3, price: 28 },
    ],
    address: 'Home, Siliguri',
    paymentMethod: 'Cash on delivery',
    bill: {
      subtotal: 516,
      delivery: 14,
      platform: 4,
      total: 534,
    },
  },
  {
    id: 'MD1031',
    placedAt: new Date('2026-10-18T14:30:00Z').toISOString(),
    status: 'DELIVERED',
    eta: null,
    pharmacy: {
      name: 'MedPlus Pharmacy, Hill Cart Rd',
      address: 'Hill Cart Road, Siliguri',
    },
    rider: {
      name: 'Amit Kumar',
      phone: '+919876543210',
    },
    items: [
      { id: 'med-4', name: 'Thyronorm', strength: '100mcg, 120 tablets', quantity: 1, price: 210 },
      { id: 'med-2', name: 'Metformin HCl', strength: '500mg ER, 10 tablets', quantity: 4, price: 45 },
      { id: 'med-19', name: 'Dolo 650', strength: '650mg, 15 tablets', quantity: 4, price: 34 },
    ],
    address: 'Home, Siliguri',
    paymentMethod: 'UPI',
    bill: {
      subtotal: 526,
      delivery: 14,
      platform: 4,
      total: 544,
    },
  },
  {
    id: 'MD1019',
    placedAt: new Date('2026-10-05T10:15:00Z').toISOString(),
    status: 'DELIVERED',
    eta: null,
    pharmacy: {
      name: 'Apollo Pharmacy, Sevoke Rd',
      address: 'Sevoke Road, Siliguri',
    },
    rider: {
      name: 'Karan Singh',
      phone: '+919812345678',
    },
    items: [
      { id: 'med-17', name: 'Vitamin D3 Calcirol', strength: '60,000 IU, 4 capsules', quantity: 5, price: 198 },
      { id: 'med-18', name: 'Neurobion Forte', strength: 'B-Complex + B12, 30 tablets', quantity: 2, price: 42 },
    ],
    address: 'Home, Siliguri',
    paymentMethod: 'UPI',
    bill: {
      subtotal: 1074,
      delivery: 0,
      platform: 8,
      total: 1082,
    },
  },
  {
    id: 'MD0982',
    placedAt: new Date('2026-09-22T18:45:00Z').toISOString(),
    status: 'DELIVERED',
    eta: null,
    pharmacy: {
      name: 'Frank Ross Pharmacy',
      address: 'Bidhan Market, Siliguri',
    },
    rider: {
      name: 'Vikram Das',
      phone: '+919834567890',
    },
    items: [
      { id: 'med-1', name: 'Paracetamol', strength: '500mg, 10 tablets', quantity: 5, price: 32 },
      { id: 'med-5', name: 'Pantoprazole DSR', strength: '40mg/30mg, 10 capsules', quantity: 3, price: 115 },
    ],
    address: 'Home, Siliguri',
    paymentMethod: 'Cash on delivery',
    bill: {
      subtotal: 505,
      delivery: 14,
      platform: 4,
      total: 523,
    },
  },
  {
    id: 'MD0945',
    placedAt: new Date('2026-09-10T11:20:00Z').toISOString(),
    status: 'CANCELLED',
    cancellationReason: 'Found better price nearby',
    eta: null,
    pharmacy: null,
    rider: null,
    items: [
      { id: 'med-10', name: 'Atorvastatin', strength: '10mg, 10 tablets', quantity: 4, price: 140 },
    ],
    address: 'Home, Siliguri',
    paymentMethod: 'UPI',
    bill: {
      subtotal: 560,
      delivery: 14,
      platform: 4,
      total: 578,
    },
  },
];

export function getMockOrders() {
  return [...mockOrdersStore];
}

/**
 * Add a newly placed order from the Cart page to appear first in Active orders.
 */
export function addMockOrder(orderData) {
  const newId = `MD${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: newId,
    placedAt: new Date().toISOString(),
    status: 'SEARCHING',
    eta: null,
    pharmacy: null,
    rider: null,
    items: orderData.items || [],
    address: orderData.address || 'Home, Siliguri',
    paymentMethod: orderData.paymentMethod === 'cod' ? 'Cash on delivery' : 'UPI',
    bill: orderData.bill || {
      subtotal: 0,
      delivery: 0,
      platform: 0,
      total: 0,
    },
    prescriptionUploaded: !!orderData.prescriptionUploaded,
  };

  mockOrdersStore = [newOrder, ...mockOrdersStore];
  return newOrder;
}

/**
 * Cancel an active order with reason.
 */
export function cancelMockOrder(orderId, reason) {
  mockOrdersStore = mockOrdersStore.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        status: 'CANCELLED',
        cancellationReason: reason || 'Customer cancelled',
      };
    }
    return o;
  });
}
