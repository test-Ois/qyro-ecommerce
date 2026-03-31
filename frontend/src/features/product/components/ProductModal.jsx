import { useState } from "react";
import API from "../../../services/api";

function ProductModal({ product, closeModal, addToCart }) {

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  if (!product) return null;

  const discount = product.discount || 0;
  const discountedPrice = product.price - (product.price * discount) / 100;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setReviewLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setReviewError("Please login to submit a review");
      setReviewLoading(false);
      return;
    }

    try {
      await API.post(`/products/${product._id}/reviews`, { rating, comment });
      setReviewSuccess("Review submitted successfully ✅");
      setComment("");
      setRating(5);
    } catch (error) {
      setReviewError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeModal}
    >
      <div
        className="relative bg-[#0f0a1e] border border-white/10 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl animate-slide-up my-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition z-10"
        >
          ✖
        </button>

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row overflow-hidden rounded-3xl">

          {/* IMAGE */}
          <div className="md:w-1/2 h-72 md:h-auto bg-[#1a1035] flex items-center justify-center">
            {product.image ? (
  <img
    src={product.image}
    alt={product.name}
    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
  />
) : (
  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#241046]">
    No Image
  </div>
)}
          </div>

          {/* INFO */}
          <div className="flex-1 p-6">

            {product.category && (
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                {product.category}
              </span>
            )}

            <h2 className="text-2xl font-bold mt-1 mb-2 leading-tight">
              {product.name}
            </h2>

            {/* RATING */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= Math.floor(product.averageRating || 0)
                        ? "text-yellow-400"
                        : "text-gray-600"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {product.averageRating?.toFixed(1) || "0"} ({product.numReviews || 0})
              </span>
            </div>

            {/* PRICE */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-bold drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                ₹{discountedPrice.toFixed(0)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.price}
                  </span>
                  <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {product.description}
            </p>

            {/* STOCK */}
            {product.stock === 0 ? (
              <span className="text-xs text-red-400 mb-4 block">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-xs text-orange-400 mb-4 block">
                ⚡ Only {product.stock} left
              </span>
            ) : (
              <span className="text-xs text-green-400 mb-4 block">In Stock</span>
            )}

            {/* BUTTON */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded-full text-sm font-semibold transition ${
                product.stock === 0
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : addedToCart
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-purple-500 to-purple-700 hover:scale-105"
              }`}
            >
              {product.stock === 0
                ? "Out of Stock"
                : addedToCart
                ? "✓ Added to Cart!"
                : "Add to Cart 🛒"}
            </button>

          </div>
        </div>

        {/* TABS */}
        <div className="border-t border-white/10">

          <div className="flex border-b border-white/10">
            {["details", "reviews", "write"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold capitalize ${
                  activeTab === tab
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "details"
                  ? "Details"
                  : tab === "reviews"
                  ? `Reviews (${product.numReviews || 0})`
                  : "Write Review"}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-3 text-sm">
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="font-medium capitalize">{product.category}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock</span>
                  <span>{product.stock} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span>{product.averageRating?.toFixed(1) || "No ratings yet"}</span>
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {product.reviews?.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review._id} className="pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                          {review.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold">{review.name}</span>
                      </div>
                      <p className="text-sm text-gray-400 ml-9">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400">No reviews yet</p>
                )}
              </div>
            )}

            {/* WRITE */}
            {activeTab === "write" && (
              <form onSubmit={handleReviewSubmit} className="space-y-4">

                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? "text-yellow-400" : "text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Write your review..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
                />

                {reviewError && <p className="text-red-400 text-sm">{reviewError}</p>}
                {reviewSuccess && <p className="text-green-400 text-sm">{reviewSuccess}</p>}

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductModal;