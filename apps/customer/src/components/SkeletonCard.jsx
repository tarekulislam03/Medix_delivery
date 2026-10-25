import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] p-4 space-y-2.5 animate-pulse">
      <div className="h-4 bg-[#EFEAD8] rounded-[999px] w-3/4" />
      <div className="h-3.5 bg-[#F7F4EC] rounded-[999px] w-1/2" />
      <div className="pt-1.5 flex items-center justify-between">
        <div className="h-6 bg-[#EFEAD8] rounded-[999px] w-28" />
        <div className="w-[88px] h-[44px] bg-[#EFEAD8] rounded-[999px]" />
      </div>
    </div>
  );
}
