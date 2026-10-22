import React from 'react';
import { Search as SearchIcon, MapPin, ChevronDown, BadgePercent } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';

export default function SearchBar({ onOpenSearch, onOpenLocation }) {
  const address = useLocationStore((state) => state.address);
  const tag = useLocationStore((state) => state.tag);

  return (
    <div className="w-full bg-surface shadow-sm border-b border-gray-100">
      {/* Top USP Strip */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-3 py-1.5 flex items-center justify-center text-[11px] font-bold shadow-xs">
        <div className="flex items-center gap-1.5 text-center truncate">
          <BadgePercent className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="font-display tracking-wide uppercase truncate">
            <span className="underline underline-offset-2 decoration-amber-300 decoration-2 font-black text-amber-200">17% Flat Discount</span> on all medicines
          </span>
        </div>
      </div>

      <div className="pt-2 pb-3 px-4">
        {/* Delivery address row - Clickable to open LocationSheet */}
        <button
          type="button"
          onClick={onOpenLocation}
          className="w-full flex items-center justify-between mb-2.5 text-xs font-medium text-ink-light hover:text-ink transition-colors touch-manipulation text-left group"
          aria-label="Change delivery location"
        >
          <div className="flex items-center space-x-1.5 min-w-0 pr-2">
            <MapPin className="w-3.5 h-3.5 text-brand-green flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate">
              Deliver to:{' '}
              {address ? (
                <strong className="text-ink font-semibold">{address}</strong>
              ) : (
                <span className="text-brand-green font-bold">Select location</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-brand-green font-semibold shrink-0">
            <span>{address ? 'Change' : 'Set'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-brand-green" />
          </div>
        </button>

        {/* High-visibility search trigger */}
        <div
          onClick={onOpenSearch}
          className="relative flex items-center cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenSearch?.();
            }
          }}
          aria-label="Open search medicines"
        >
          <div className="absolute left-3.5 pointer-events-none flex items-center justify-center">
            <SearchIcon className="w-5 h-5 text-brand-green group-hover:scale-105 transition-transform" />
          </div>

          <div className="w-full h-12 pl-11 pr-4 bg-white rounded-pill text-sm font-medium text-gray-400 border-2 border-gray-200/90 shadow-xs group-hover:border-emerald-400 flex items-center transition-all duration-200 touch-manipulation">
            <span className="truncate">Search medicines, salts, healthcare...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
