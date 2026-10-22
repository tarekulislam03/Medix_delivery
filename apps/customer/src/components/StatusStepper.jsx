import React from 'react';
import { Check } from 'lucide-react';
import { ORDER_STATUSES } from '../lib/orderStatus';

const TIMELINE_STEPS = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    index: 0,
    activeSubtitle: 'Order received and being processed',
  },
  {
    key: 'CONFIRMED',
    label: 'Order Confirmed',
    index: 1,
    activeSubtitle: 'Pharmacy accepted your order',
  },
  {
    key: 'PACKED',
    label: 'Order Packed',
    index: 2,
    activeSubtitle: 'Medicines packed and ready for pickup',
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    index: 3,
    activeSubtitle: 'Rider is on the way to your address',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    index: 4,
    activeSubtitle: 'Order handed over successfully',
  },
];

export default function StatusStepper({ status }) {
  const currentConfig = ORDER_STATUSES[status];
  const activeStepIndex = currentConfig ? currentConfig.stepIndex : 0;
  const isSearching = status === 'SEARCHING';

  if (status === 'CANCELLED') {
    return (
      <div className="py-2.5 px-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold text-center border border-red-200/60">
        Order was cancelled
      </div>
    );
  }

  return (
    <div className="py-2 pl-1 pr-2">
      <div className="relative">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = step.index < activeStepIndex;
          const isCurrent = step.index === activeStepIndex;
          const isLast = idx === TIMELINE_STEPS.length - 1;

          // Connecting line color
          const isLineCompleted = step.index < activeStepIndex;

          return (
            <div key={step.key} className="relative flex items-start gap-3">
              {/* Timeline Indicator Column */}
              <div className="relative flex flex-col items-center flex-shrink-0">
                {/* Dot */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-brand-green text-white shadow-xs'
                      : isCurrent
                      ? isSearching
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                        : 'bg-brand-green text-white ring-4 ring-emerald-100 shadow-sm'
                      : 'bg-white border-2 border-gray-200 text-transparent'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : isCurrent ? (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  ) : null}
                </div>

                {/* Vertical Connecting Line */}
                {!isLast && (
                  <div
                    className={`w-0.5 my-1 transition-colors ${
                      isLineCompleted ? 'bg-brand-green' : 'bg-gray-200'
                    }`}
                    style={{ minHeight: isCurrent ? '34px' : '22px' }}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className={`min-w-0 flex-1 ${!isLast ? 'pb-3' : 'pb-0'}`}>
                <div>
                  <p
                    className={`text-xs leading-snug ${
                      isCurrent
                        ? isSearching
                          ? 'font-bold text-amber-700'
                          : 'font-bold text-brand-green'
                        : isCompleted
                        ? 'font-semibold text-ink'
                        : 'font-medium text-gray-400'
                    }`}
                  >
                    {isCurrent && isSearching ? 'Finding nearby pharmacy...' : step.label}
                  </p>
                </div>

                {/* Subtitle / Description shown for active or searching step */}
                {isCurrent && (
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {isSearching
                      ? 'Connecting with partner pharmacies in your area...'
                      : step.activeSubtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
