import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set, get) => ({
      fullName: '',
      address: '',
      fullAddress: '',
      villagePo: '',
      pinCode: '',
      landmark: '',
      hasLocationSelected: false,
      savedAddresses: [],

      // Save a new address with Name + Village & PO + PIN Code + Landmark
      saveAddress: ({ fullName = '', villagePo, pinCode, landmark = '' }) => {
        const cleanName = fullName.trim();
        const cleanVillagePo = villagePo.trim();
        const cleanPin = pinCode.trim();
        const cleanLandmark = landmark.trim();

        const short = `${cleanVillagePo}, ${cleanPin}`;
        const full = [
          cleanName || null,
          cleanVillagePo,
          cleanLandmark ? `Near ${cleanLandmark}` : null,
          `PIN: ${cleanPin}`,
        ]
          .filter(Boolean)
          .join(', ');

        const newEntry = {
          id: `addr-${Date.now()}`,
          fullName: cleanName,
          villagePo: cleanVillagePo,
          pinCode: cleanPin,
          landmark: cleanLandmark,
          address: short,
          fullAddress: full,
        };

        const existing = get().savedAddresses || [];
        // Keep unique by villagePo + pinCode
        const filtered = existing.filter(
          (a) => !(a.villagePo === newEntry.villagePo && a.pinCode === newEntry.pinCode)
        );

        set({
          fullName: newEntry.fullName,
          address: newEntry.address,
          fullAddress: newEntry.fullAddress,
          villagePo: newEntry.villagePo,
          pinCode: newEntry.pinCode,
          landmark: newEntry.landmark,
          hasLocationSelected: true,
          savedAddresses: [newEntry, ...filtered],
        });

        return newEntry;
      },

      // Select an existing saved address
      setDeliveryAddress: (item) => {
        set({
          fullName: item.fullName || '',
          address: item.address,
          fullAddress: item.fullAddress || item.address,
          villagePo: item.villagePo || '',
          pinCode: item.pinCode || '',
          landmark: item.landmark || '',
          hasLocationSelected: true,
        });
      },

      setAddress: (address) => set({ address, hasLocationSelected: Boolean(address) }),
    }),
    {
      name: 'medix_customer_location',
      version: 4,
      migrate: (persistedState, version) => {
        if (version < 4 || persistedState?.address?.includes('Sevoke Road') || persistedState?.tag === 'Home') {
          return {
            fullName: '',
            address: '',
            fullAddress: '',
            villagePo: '',
            pinCode: '',
            landmark: '',
            hasLocationSelected: false,
            savedAddresses: [],
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        fullName: state.fullName,
        address: state.address,
        fullAddress: state.fullAddress,
        villagePo: state.villagePo,
        pinCode: state.pinCode,
        landmark: state.landmark,
        hasLocationSelected: state.hasLocationSelected,
        savedAddresses: state.savedAddresses,
      }),
    }
  )
);
