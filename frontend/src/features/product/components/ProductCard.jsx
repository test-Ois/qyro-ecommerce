import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../../../hooks/useOptimizedImage";

function ProductCard({ product, addToCart, openModal, compact = false }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [wishlisted, setWishlisted] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showVariantPreview, setShowVariantPreview] = useState(false);

  const discount = product.discount || 0;
  const discountedPrice = product.price - (product.price * discount) / 100;
  const hasVariants = product?.variants && product.variants.length > 0;

  const previewSizes = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Set(product.variants.map((v) => v.size).filter(Boolean))].slice(0, 4);
  }, [hasVariants, product.variants]);

  const previewColors = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Set(product.variants.map((v) => v.color).filter(Boolean))].slice(0, 4);
  }, [hasVariants, product.variants]);

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }

    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);

    try {
      await API.post(`/wishlist/${product._id}`);
      setWishlisted(true);
    } catch (error) {
      if (error.response?.data?.message === "Already in wishlist") {
        setWishlisted(true);
      }
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (hasVariants) {
      navigate(`/product/${product._id}`, {
        state: { product }
      });
      return;
    }

    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleTogglePreview = (e) => {
    e.stopPropagation();
    setShowVariantPreview((prev) => !prev);
  };

  return (
    <div
      onClick={() => openModal(product)}
      className={`cursor-pointer group relative overflow-hidden transition-all duration-300 bg-[#1a1035]/60 backdrop-blur-lg border border-white/10 ${
        compact
          ? "rounded-[18px] hover:-translate-y-1"
          : "rounded-[20px] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(124,58,237,0.3)]"
      }`}
    >
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-yellow-400 text-black shadow-md">
            {discount}% OFF
          </span>
        </div>
      )}

      {product?.isDeal && (
        <div className="absolute top-3 left-3 z-10 translate-y-8">
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 border border-pink-400/30">
            Hot Deal
          </span>
        </div>
      )}

      <div className={`relative overflow-hidden ${compact ? "h-40" : "h-56"}`}>
        {product.image || (product.images && product.images.length > 0) ? (
          <OptimizedImage
            src={product.images && product.images.length > 0 ? product.images[0].url : product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            lazy={true}
            quality="auto"
            placeholder={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#241046]">
            No Image
          </div>
        )}

        <button
          onClick={handleWishlist}
          className={`absolute bottom-3 right-3 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-md transition ${
            compact ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${heartAnim ? "animate-heart" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#ef4444" : "none"}
            stroke="#ef4444"
            strokeWidth="2"
            className={`w-5 h-5 transition ${
              wishlisted ? "scale-110" : "hover:scale-110"
            }`}
          >
            <path d="M20.84 4.61c-1.54-1.34-3.77-1.21-5.24.2L12 8.41l-3.6-3.6c-1.47-1.41-3.7-1.54-5.24-.2-1.71 1.49-1.79 4.09-.16 5.69L12 21l9-10.7c1.63-1.6 1.55-4.2-.16-5.69z" />
          </svg>
        </button>
      </div>

      <div className={compact ? "p-3" : "p-4"}>
        {product.category && (
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            {product.category}
          </span>
        )}

        <h3
          className={`font-medium text-white mt-1 mb-1 truncate ${
            compact ? "text-[15px]" : "text-sm"
          }`}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-xs ${
                star <= Math.floor(product.averageRating || 0)
                  ? "text-yellow-400"
                  : "text-gray-600"
              }`}
            >
              ★
            </span>
          ))}
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>

        <div className={`flex items-center gap-2 ${compact ? "mb-2" : "mb-3"}`}>
          <span className={`${compact ? "text-[15px]" : "text-lg"} font-semibold text-white group-hover:text-yellow-300 transition`}>
            ₹{discountedPrice.toFixed(0)}
          </span>

          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
          )}
        </div>

        {hasVariants ? (
          <button
            type="button"
            onClick={handleTogglePreview}
            className={`mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-500/10 text-yellow-300 transition hover:bg-yellow-500/20 ${
              compact ? "px-3 py-1.5 text-[11px]" : "px-3 py-1.5 text-xs"
            }`}
          >
            <span>Options Available</span>
            <span
              className={`transition-transform duration-300 ${
                showVariantPreview ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </button>
        ) : product.stock === 0 ? (
          <span className="text-xs text-red-400 mb-3 block">Out of Stock</span>
        ) : product.stock <= 5 ? (
          <span className="text-xs text-orange-400 mb-3 block">
            Only {product.stock} left
          </span>
        ) : (
          <span className="text-[11px] text-green-400/90 mb-3 block">In Stock</span>
        )}

        {hasVariants && showVariantPreview && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`mb-4 rounded-2xl border border-white/20 bg-white/5 ${
              compact ? "p-3" : "p-4"
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-300 mb-2">
              Variant Preview
            </p>

            {previewSizes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {previewSizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 rounded-full text-xs bg-[#2b124f] text-white border border-white/10"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {previewColors.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Colors</p>
                <div className="flex flex-wrap gap-2">
                  {previewColors.map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1 rounded-full text-xs bg-[#2b124f] text-white border border-white/10"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!hasVariants && product.stock === 0}
          className={`w-full rounded-full font-semibold ${
  compact ? "py-2 text-xs" : "py-2.5 text-sm"
} ${
  !hasVariants && product.stock === 0
    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
    : addedToCart
    ? "bg-green-500 text-white"
    : "bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:scale-105 active:scale-95 transition-all duration-200"
}`}
        >
          {!hasVariants && product.stock === 0
            ? "Out of Stock"
            : hasVariants
            ? "Check out"
            : addedToCart
            ? "✓ Added!"
            : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] bg-[#1a1035]/60 border border-white/10 animate-pulse">

      {/* Image */}
      <div className="h-56 w-full bg-white/10" />

      <div className="p-4 space-y-3">

        {/* Category */}
        <div className="h-3 w-20 bg-white/10 rounded" />

        {/* Title */}
        <div className="h-4 w-3/4 bg-white/10 rounded" />

        {/* Rating */}
        <div className="h-3 w-24 bg-white/10 rounded" />

        {/* Price */}
        <div className="h-5 w-28 bg-white/10 rounded" />

        {/* Button */}
        <div className="h-10 w-full bg-white/10 rounded-full" />

      </div>
    </div>
  );
}

export default ProductCard;