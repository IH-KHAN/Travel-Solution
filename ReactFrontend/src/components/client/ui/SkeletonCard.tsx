import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0 w-72">
    <div className="skeleton h-48 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-5 w-4/5 rounded" />
      <div className="skeleton h-4 w-3/5 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="flex items-center justify-between mt-2">
        <div className="skeleton h-5 w-1/3 rounded" />
        <div className="skeleton h-9 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

export const SkeletonCards: React.FC<SkeletonCardProps> = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </>
);

export const SkeletonDestinationCard: React.FC = () => (
  <div className="skeleton rounded-2xl h-52 w-full" />
);
