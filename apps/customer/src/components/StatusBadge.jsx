import React from 'react';
import { Bike, Search, Check, Package, X, Clock } from 'lucide-react';
import { ORDER_STATUSES } from '../lib/orderStatus';

export default function StatusBadge({ status }) {
  const config = ORDER_STATUSES[status] || {
    label: status,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  // Dedicated micro-icon for each status instead of a blinking dot
  const renderIcon = () => {
    switch (status) {
      case 'OUT_FOR_DELIVERY':
        return <Bike className="w-3 h-3 text-blue-600 flex-shrink-0" />;
      case 'SEARCHING':
        return <Search className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />;
      case 'CONFIRMED':
        return <Clock className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />;
      case 'PACKED':
        return <Package className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />;
      case 'DELIVERED':
        return <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3] flex-shrink-0" />;
      case 'CANCELLED':
        return <X className="w-2.5 h-2.5 text-red-600 stroke-[3] flex-shrink-0" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border leading-tight ${config.badgeClass}`}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
