import React from "react";

export function Skeleton({ className = "", variant = "rect" }) {
  const baseClass = "animate-pulse bg-white/10";
  
  let variantClass = "rounded-lg";
  if (variant === "circle") {
    variantClass = "rounded-full";
  } else if (variant === "text") {
    variantClass = "rounded h-4 w-full";
  }

  return <div className={`${baseClass} ${variantClass} ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md flex flex-col h-full space-y-4">
      {/* Image Skeleton */}
      <Skeleton className="aspect-square w-full rounded-2xl" />
      
      {/* Title & Brand Skeleton */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/3 h-3" />
        <Skeleton variant="text" className="w-3/4 h-5" />
      </div>

      {/* Rating & Stock Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-1/4 h-4 rounded" />
        <Skeleton className="w-1/5 h-4 rounded" />
      </div>

      {/* Price & Button Skeleton */}
      <div className="flex items-center justify-between pt-2 mt-auto">
        <Skeleton className="w-1/3 h-6 rounded" />
        <Skeleton className="w-24 h-9 rounded-full" />
      </div>
    </div>
  );
}

export function WishlistRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
      <Skeleton className="w-16 h-16 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/4 h-3" />
        <Skeleton variant="text" className="w-1/2 h-5" />
        <Skeleton variant="text" className="w-1/6 h-4" />
      </div>
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
      {/* Image Gallery Skeleton */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </div>
      {/* Product Details Info Skeleton */}
      <div className="space-y-6">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="text" className="w-3/4 h-8" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-5 rounded" />
          <Skeleton className="w-20 h-5 rounded" />
        </div>
        <Skeleton variant="text" className="w-1/3 h-7" />
        <div className="space-y-2">
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-5/6 h-4" />
        </div>
        <div className="border-t border-white/10 pt-6 space-y-4">
          <Skeleton variant="text" className="w-1/4 h-4" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-12 h-10 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <Skeleton className="flex-1 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-6">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}
