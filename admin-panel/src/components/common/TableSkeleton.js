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

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-300">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-4 font-semibold">
                  <Skeleton className="h-4 w-20 bg-white/15" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="hover:bg-white/5 transition-colors duration-200">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="px-6 py-4">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md flex flex-col space-y-4">
      <Skeleton className="w-1/3 h-4" />
      <Skeleton className="w-1/2 h-8" />
      <Skeleton className="w-2/3 h-3" />
    </div>
  );
}
