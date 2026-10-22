import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-surface rounded-card shadow-card border border-gray-100 p-4 flex items-center justify-between gap-3 animate-pulse">
      <div className="flex-1 min-w-0 pr-2">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="flex-shrink-0">
        <div className="w-[76px] h-11 bg-gray-200 rounded-pill"></div>
      </div>
    </div>
  );
}
