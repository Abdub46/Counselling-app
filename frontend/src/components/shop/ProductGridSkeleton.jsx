import React from 'react';

const ProductCardSkeleton = () => (
  <div className="card !p-0 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-4/5" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-100 rounded w-16" />
        <div className="h-9 w-9 bg-gray-100 rounded-full" />
      </div>
    </div>
  </div>
);

const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductGridSkeleton;
