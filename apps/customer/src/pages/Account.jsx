import React from 'react';
import { User, MapPin, Bell, Shield, HelpCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useLocationStore } from '../store/locationStore';

export default function Account() {
  const name = useUserStore((state) => state.name) || useLocationStore((state) => state.fullName);
  const phone = useUserStore((state) => state.phone);
  const isVerified = useUserStore((state) => state.isVerified);
  const address = useLocationStore((state) => state.address);

  const menuItems = [
    { icon: MapPin, title: 'Saved Delivery Address', subtitle: address || 'No address set yet' },
    { icon: Bell, title: 'Notifications', subtitle: 'Order status alerts enabled' },
    { icon: Shield, title: 'Privacy & Security', subtitle: 'Manage your data' },
    { icon: HelpCircle, title: 'Help & Support', subtitle: 'FAQs and support chat' },
  ];

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-white pb-28">
      {/* Profile Header */}
      <div className="bg-surface rounded-card shadow-card border border-gray-100 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-green font-bold text-lg">
            <User className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">
              {name || 'Guest Customer'}
            </h2>
            <p className="text-xs text-ink-light">
              {phone ? `+91 ${phone}` : 'Phone not verified yet'}
            </p>
          </div>
        </div>

        {isVerified && (
          <div className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-brand-green text-[11px] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Settings list */}
      <div className="bg-surface rounded-card shadow-card border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer min-h-[48px] touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-ink-light">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">{item.title}</p>
                  <p className="text-[11px] text-ink-light">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-lighter" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
