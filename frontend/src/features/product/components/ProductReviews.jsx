import { useMemo, useState } from "react";

export default function ProductReviews({ reviews = [] }) {
  const [sortBy, setSortBy] = useState("latest");

  const sortedReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    const clone = [...reviews];

    if (sortBy === "highest") {
      return clone.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === "lowest") {
      return clone.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }

    return clone.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, sortBy]);

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-[#120422] p-4 sm:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-white">Reviews ({reviews.length})</h3>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>Sort:</span>
          <select
            className="rounded-lg bg-[#1a0c35] border border-white/10 px-2 py-1 text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {sortedReviews.length === 0 ? (
        <p className="mt-2 text-sm text-gray-400">Be the first to review this product.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {sortedReviews.map((review) => (
            <li key={review._id || `${review.user}-${review.createdAt}`} className="rounded-xl border border-white/10 p-3 bg-[#0e0620]">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{review.name || review.user || "Anonymous"}</p>
                <span className="text-xs font-bold text-yellow-300">{(review.rating || 0).toFixed(1)}/5</span>
              </div>
              <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
              <p className="mt-1 text-sm text-gray-300">{review.comment || "No comment provided."}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
