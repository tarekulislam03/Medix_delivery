import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

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
      activeAddressId: null,
      isLoading: false,

      // Fetch user's saved addresses from MongoDB
      fetchAddresses: async () => {
        const token = localStorage.getItem('medix_customer_token');
        if (!token) {
          set({
            fullName: '',
            address: '',
            fullAddress: '',
            villagePo: '',
            pinCode: '',
            landmark: '',
            hasLocationSelected: false,
            savedAddresses: [],
            activeAddressId: null,
          });
          return [];
        }

        set({ isLoading: true });
        try {
          const res = await api.get('/me/addresses');
          const data = res.data?.data || {};
          const rawAddresses = data.addresses || [];
          const defaultId = data.defaultAddressId;

          const normalized = rawAddresses.map((addr) => {
            const short = `${addr.villagePo}, ${addr.pinCode}`;
            const full = [
              addr.fullName,
              addr.villagePo,
              addr.landmark ? `Near ${addr.landmark}` : null,
              `PIN: ${addr.pinCode}`,
            ]
              .filter(Boolean)
              .join(', ');

            return {
              id: addr._id || addr.id,
              _id: addr._id,
              fullName: addr.fullName || '',
              phone: addr.phone || '',
              villagePo: addr.villagePo || '',
              pinCode: addr.pinCode || '',
              landmark: addr.landmark || '',
              label: addr.label || 'Home',
              address: short,
              fullAddress: full,
              isDefault: Boolean(addr.isDefault || (defaultId && String(addr._id) === String(defaultId))),
            };
          });

          const currentId = get().activeAddressId;
          const currentMatches = normalized.find((a) => a.id === currentId);
          const defaultMatches = normalized.find((a) => a.isDefault);
          const active = currentMatches || defaultMatches || normalized[0];

          if (active) {
            set({
              fullName: active.fullName,
              villagePo: active.villagePo,
              pinCode: active.pinCode,
              landmark: active.landmark,
              address: active.address,
              fullAddress: active.fullAddress,
              hasLocationSelected: true,
              activeAddressId: active.id,
              savedAddresses: normalized,
              isLoading: false,
            });
          } else {
            set({
              fullName: '',
              address: '',
              fullAddress: '',
              villagePo: '',
              pinCode: '',
              landmark: '',
              hasLocationSelected: false,
              savedAddresses: [],
              activeAddressId: null,
              isLoading: false,
            });
          }

          return normalized;
        } catch (err) {
          console.error('[locationStore] fetchAddresses error:', err);
          set({ isLoading: false });
          return [];
        }
      },

      // Save a new address in DB & store
      saveAddress: async ({ fullName = '', villagePo, pinCode, landmark = '', phone = '', label = 'Home' }) => {
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

        const token = localStorage.getItem('medix_customer_token');
        let newEntry = {
          id: `addr-${Date.now()}`,
          fullName: cleanName,
          phone,
          villagePo: cleanVillagePo,
          pinCode: cleanPin,
          landmark: cleanLandmark,
          label,
          address: short,
          fullAddress: full,
          isDefault: true,
        };

        if (token) {
          try {
            const res = await api.post('/me/addresses', {
              fullName: cleanName,
              villagePo: cleanVillagePo,
              pinCode: cleanPin,
              landmark: cleanLandmark,
              phone: phone || undefined,
              label,
              isDefault: true,
            });

            const saved = res.data?.data?.address;
            if (saved?._id) {
              newEntry = {
                ...newEntry,
                id: saved._id,
                _id: saved._id,
              };
            }
          } catch (err) {
            console.error('[locationStore] Failed to save address to DB:', err);
          }
        }

        const existing = get().savedAddresses || [];
        const filtered = existing.filter((a) => a.id !== newEntry.id);

        set({
          fullName: newEntry.fullName,
          address: newEntry.address,
          fullAddress: newEntry.fullAddress,
          villagePo: newEntry.villagePo,
          pinCode: newEntry.pinCode,
          landmark: newEntry.landmark,
          hasLocationSelected: true,
          activeAddressId: newEntry.id,
          savedAddresses: [newEntry, ...filtered],
        });

        return newEntry;
      },

      // Select an existing saved address
      setDeliveryAddress: (item) => {
        const id = item.id || item._id;
        set({
          fullName: item.fullName || '',
          address: item.address,
          fullAddress: item.fullAddress || item.address,
          villagePo: item.villagePo || '',
          pinCode: item.pinCode || '',
          landmark: item.landmark || '',
          hasLocationSelected: true,
          activeAddressId: id,
        });

        const token = localStorage.getItem('medix_customer_token');
        if (token && item._id) {
          api.post(`/me/addresses/${item._id}/default`).catch(() => {});
        }
      },

      // Delete an address
      deleteAddress: async (addressId) => {
        const token = localStorage.getItem('medix_customer_token');
        if (token && addressId && !String(addressId).startsWith('addr-')) {
          try {
            await api.delete(`/me/addresses/${addressId}`);
          } catch (err) {
            console.error('[locationStore] deleteAddress error:', err);
          }
        }

        const updated = (get().savedAddresses || []).filter(
          (a) => a.id !== addressId && a._id !== addressId
        );

        if (get().activeAddressId === addressId) {
          const nextActive = updated[0] || null;
          if (nextActive) {
            set({
              fullName: nextActive.fullName,
              villagePo: nextActive.villagePo,
              pinCode: nextActive.pinCode,
              landmark: nextActive.landmark,
              address: nextActive.address,
              fullAddress: nextActive.fullAddress,
              hasLocationSelected: true,
              activeAddressId: nextActive.id,
              savedAddresses: updated,
            });
          } else {
            set({
              fullName: '',
              villagePo: '',
              pinCode: '',
              landmark: '',
              address: '',
              fullAddress: '',
              hasLocationSelected: false,
              activeAddressId: null,
              savedAddresses: [],
            });
          }
        } else {
          set({ savedAddresses: updated });
        }
      },

      clearAddresses: () => {
        set({
          fullName: '',
          address: '',
          fullAddress: '',
          villagePo: '',
          pinCode: '',
          landmark: '',
          hasLocationSelected: false,
          savedAddresses: [],
          activeAddressId: null,
        });
      },
    }),
    {
      name: 'medix_customer_location',
      version: 5,
      migrate: () => ({
        fullName: '',
        address: '',
        fullAddress: '',
        villagePo: '',
        pinCode: '',
        landmark: '',
        hasLocationSelected: false,
        savedAddresses: [],
        activeAddressId: null,
      }),
    }
  )
);
