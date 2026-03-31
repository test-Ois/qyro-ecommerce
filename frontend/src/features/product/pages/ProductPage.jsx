import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import useProduct from "../../../hooks/useProduct";
import ProductGallery from "../components/ProductGallery";
import ProductInfo from "../components/ProductInfo";
import ProductVariants from "../components/ProductVariants";
import ProductActions from "../components/ProductActions";
import ProductBadges from "../components/ProductBadges";
import ProductDelivery from "../components/ProductDelivery";
import ProductTabs from "../components/ProductTabs";
import ProductReviews from "../components/ProductReviews";
import RelatedProducts from "../components/RelatedProducts";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ✅ All business logic from hook
  const {
    product,
    related,
    loading,
    error,
    selectedSize,
    selectedColor,
    sizes,
    colors,
    availableSizesForColor,
    availableColorsForSize,
    selectedVariant,
    finalPrice,
    rawPrice,
    discount,
    displayStock,
    displayImage,
    variantImages,
    addToCart,
    selectSize,
    selectColor,
    showSticky,
    reviewLoading,
    submitReview
  } = useProduct(id);

  // ✅ Local state: review form only (UI state, not business logic)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  // ✅ Handlers: User interactions
  const handleAddToCart = () => {
    try {
      addToCart();
      alert("Added to cart ✅");
    } catch (err) {
      alert(err.message || "Unable to add to cart");
    }
  };

  const handleBuyNow = () => {
    try {
      addToCart();
      navigate("/checkout");
    } catch (err) {
      alert(err.message || "Unable to proceed to checkout");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const message = await submitReview(reviewRating, reviewComment, user);
      setReviewComment("");
      setReviewRating(5);
      setReviewMessage(message);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Could not submit review";
      setReviewMessage(errorMsg);
    }
  };

  // Variant requirement calculation
  const variantRequired = Boolean((sizes.length > 0 || colors.length > 0) && !selectedVariant);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070014] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-80 animate-pulse rounded-3xl bg-white/10" />
          <div className="mt-8 h-6 w-56 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#070014] px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#120422] p-8 text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="mt-2 text-sm text-gray-400">{error || "Unable to load product."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070014] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <ProductGallery images={variantImages} name={product.name} fallbackImage={displayImage} />

          <div className="flex flex-col">
            <ProductBadges discount={discount} isDeal={product.isDeal} />

            <ProductInfo
              product={product}
              finalPrice={finalPrice}
              rawPrice={rawPrice}
              discount={discount}
              rating={product.averageRating}
              numReviews={product.numReviews}
            />

            <ProductVariants
              sizes={sizes}
              colors={colors}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              availableSizes={availableSizesForColor}
              availableColors={availableColorsForSize}
              onSelectSize={selectSize}
              onSelectColor={selectColor}
            />

            <ProductDelivery />

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-gray-300">
                <strong>✅ Fast Delivery:</strong> 1-3 business days within eligible cities.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-gray-300">
                <strong>🔒 Secure Checkout</strong> with encrypted payment and buyer protection.
              </div>
            </div>

            <ProductActions
              displayStock={displayStock}
              variantRequired={variantRequired}
              disabled={displayStock < 1}
              onAdd={handleAddToCart}
            />

            <ProductTabs description={product.description} />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#120422] p-4 sm:p-5">
          <h3 className="text-lg font-bold text-white">Write a review</h3>
          <p className="mt-1 text-xs text-gray-400">Share your experience and help others decide.</p>

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="mt-3 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 px-4 py-2 text-sm font-semibold text-black"
            >
              Login to review
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="rounded-lg border border-white/10 bg-[#0f0a23] px-2 py-1 text-white"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Describe your experience"
                className="w-full rounded-xl border border-white/10 bg-[#0f0a23] p-3 text-sm text-white"
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
                {reviewMessage && <p className="text-sm text-green-300">{reviewMessage}</p>}
              </div>
            </form>
          )}
        </div>

        <ProductReviews reviews={product.reviews || []} />

        <RelatedProducts data={related} />
      </div>

      {showSticky && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#070014]/95 backdrop-blur-sm px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="space-y-1 text-sm text-white">
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-gray-300">{selectedSize && `Size: ${selectedSize}`} {selectedColor && `Color: ${selectedColor}`}</p>
              <p className="text-lg font-bold text-yellow-400">₹{finalPrice.toFixed(0)}</p>
            </div>
            <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
              <button
                onClick={handleAddToCart}
                disabled={displayStock < 1 || variantRequired}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-40"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={displayStock < 1 || variantRequired}
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-40"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
