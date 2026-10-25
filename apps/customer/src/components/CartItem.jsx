import React from 'react';
import { Trash2 } from 'lucide-react';
import QtyStepper from './QtyStepper';
import { formatPrice } from '../lib/fees';
import { useT } from '../lib/i18n';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const t = useT();
  const lineTotal = item.price * item.quantity;

  return (
    <div className="p-4 rounded-[16px] bg-white flex items-center justify-between gap-3 select-none">
      {/* Medicine Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <h4 className="font-display font-bold text-[16px] text-[#0E1A14] tracking-[-0.02em] leading-snug truncate">
            {item.name}
          </h4>
          {item.requiresRx && (
            <span className="shrink-0 px-2 py-0.5 rounded-[999px] bg-[#D64538]/12 text-[#D64538] text-[11px] font-bold uppercase">
              Rx
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-baseline gap-2.5 flex-wrap">
          <span className="font-display text-[20px] font-bold text-[#0E1A14] tracking-[-0.02em] tabular-nums leading-none">
            {formatPrice(lineTotal)}
          </span>
          <span className="text-[14px] text-[#5E6B63] font-medium tabular-nums">
            ({formatPrice(item.price)} × {t.num(item.quantity)})
          </span>
        </div>
      </div>

      {/* Stepper & Quiet Remove Action */}
      <div className="flex items-center gap-2 shrink-0">
        <QtyStepper
          quantity={item.quantity}
          onIncrement={() => onIncrement(item.id)}
          onDecrement={() => onDecrement(item.id)}
        />

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="w-11 h-11 rounded-[999px] bg-[#F7F4EC] hover:bg-[#EFEAD8] active:scale-[0.94] transition-transform duration-150 flex items-center justify-center text-[#5E6B63] hover:text-[#D64538] touch-manipulation cursor-pointer select-none"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
}
