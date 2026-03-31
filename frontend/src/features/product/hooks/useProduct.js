import { useCallback, useEffect, useMemo, useState } from "react";
import { getProduct, getRelatedProducts } from "../../../services/productService";
import API from "../../../services/api";

const RECENT_LIMIT = 8;

export default function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ NEW: For sticky action bar and review state
  const [showSticky, setShowSticky] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  // ✅ NEW: Setup sticky scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const p = await getProduct(id);

        if (!active) return;

        if (!p) throw new Error("Product not found");

        setProduct(p);
        setSelectedSize("");
        setSelectedColor("");

        if (p.category) {
          const relatedItems = await getRelatedProducts(p.category, p._id);
          if (active) setRelated(relatedItems);
        }

        try {
          const existing = JSON.parse(localStorage.getItem("recentlyViewedProducts")) || [];
          const cleanProduct = {
            _id: p._id,
            name: p.name,
            image: p.image,
            price: p.price,
            discount: p.discount || 0,
            category: p.category,
            stock: p.stock,
            isDeal: p.isDeal || false,
            averageRating: p.averageRating || 0,
            numReviews: p.numReviews || 0,
            variants: Array.isArray(p.variants) ? p.variants : []
          };

          const filtered = existing.filter((item) => item._id !== cleanProduct._id);
          localStorage.setItem(
            "recentlyViewedProducts",
            JSON.stringify([cleanProduct, ...filtered].slice(0, RECENT_LIMIT))
          );
          window.dispatchEvent(new Event("recentlyViewedUpdated"));
        } catch (err) {
          console.warn("Could not save recently viewed", err);
        }
      } catch (err) {
        setError(err.message || "Unable to load product");
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  const variants = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  const sizes = useMemo(() => {
    return [...new Set(variants.map((v) => v.size).filter(Boolean))];
  }, [variants]);

  const colors = useMemo(() => {
    return [...new Set(variants.map((v) => v.color).filter(Boolean))];
  }, [variants]);

  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return sizes;

    return [
      ...new Set(
        variants
          .filter((v) => v.color === selectedColor && v.stock > 0)
          .map((v) => v.size)
          .filter(Boolean)
      )
    ];
  }, [variants, selectedColor, sizes]);

  const availableColorsForSize = useMemo(() => {
    if (!selectedSize) return colors;

    return [
      ...new Set(
        variants
          .filter((v) => v.size === selectedSize && v.stock > 0)
          .map((v) => v.color)
          .filter(Boolean)
      )
    ];
  }, [variants, selectedSize, colors]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    if (selectedSize && selectedColor) {
      return (
        variants.find((v) => v.size === selectedSize && v.color === selectedColor) || null
      );
    }

    if (selectedSize) {
      return variants.find((v) => v.size === selectedSize && v.stock > 0) || null;
    }

    if (selectedColor) {
      return variants.find((v) => v.color === selectedColor && v.stock > 0) || null;
    }

    return null;
  }, [variants, selectedSize, selectedColor]);

  const rawPrice = selectedVariant?.price || product?.price || 0;
  const discount = product?.discount || 0;
  const finalPrice = rawPrice - (rawPrice * discount) / 100;

  const displayStock =
    selectedSize && selectedColor
      ? selectedVariant?.stock ?? 0
      : product?.stock ?? 0;

  const displayImage = selectedVariant?.image ||
    (product?.images && product.images.length > 0 ? product.images[0].url : "") ||
    product?.image || "";

  const allImages = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0
      ? product.images.map(img => img.url)
      : product.image ? [product.image] : [];
  }, [product]);

  const variantImages = useMemo(() => {
    if (!selectedVariant) return allImages;

    if (selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images.map(img => img.url);
    }

    if (selectedVariant.image) {
      return [selectedVariant.image, ...allImages.filter(img => img !== selectedVariant.image)];
    }

    return allImages;
  }, [selectedVariant, allImages]);

  const selectedVariantLabel = selectedVariant?.sku || "";

  const addToCart = useCallback(() => {
    if (!product) return;

    const requiresVariant = variants.length > 0;
    const hasSize = sizes.length > 0;
    const hasColor = colors.length > 0;

    if (requiresVariant) {
      if (hasSize && !selectedSize) throw new Error("Please select size");
      if (hasColor && !selectedColor) throw new Error("Please select color");
      if (!selectedVariant) throw new Error("Selected variant is not available");
      if (selectedVariant.stock < 1) throw new Error("Selected variant is out of stock");
    }

    const cartItem = {
      ...product,
      quantity: 1,
      originalPrice: rawPrice,
      price: finalPrice,
      image: displayImage || product.image,
      selectedSize,
      selectedColor,
      selectedVariantId: selectedVariant?._id || "",
      selectedSku: selectedVariantLabel,
      selectedStock: selectedVariant?.stock || product.stock || 0
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = existingCart.findIndex(
      (item) =>
        item._id === cartItem._id &&
        item.selectedSize === cartItem.selectedSize &&
        item.selectedColor === cartItem.selectedColor
    );

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    return true;
  }, [product, selectedVariant, selectedSize, selectedColor, rawPrice, finalPrice, displayImage, variants, sizes, colors, selectedVariantLabel]);

  const selectSize = useCallback((size) => {
    setSelectedSize((current) => (current === size ? "" : size));
  }, []);

  const selectColor = useCallback((color) => {
    setSelectedColor((current) => (current === color ? "" : color));
  }, []);

  const refreshProduct = useCallback(() => setRefreshKey((current) => current + 1), []);

  // ✅ NEW: Review submission callback
  const submitReview = useCallback(async (rating, comment, user) => {
    if (!user) {
      throw new Error("Must be logged in to review");
    }

    if (!comment.trim()) {
      throw new Error("Please write a review message.");
    }

    try {
      setReviewLoading(true);
      await API.post(`/products/${id}/reviews`, {
        rating: Number(rating),
        comment: comment.trim()
      });
      refreshProduct();
      return "Review submitted successfully ✅";
    } finally {
      setReviewLoading(false);
    }
  }, [id, refreshProduct]);

  return {
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
    selectedVariantLabel,
    rawPrice,
    finalPrice,
    discount,
    displayStock,
    displayImage,
    allImages,
    variantImages,
    variants,
    selectSize,
    selectColor,
    addToCart,
    refreshProduct,
    // ✅ NEW
    showSticky,
    reviewLoading,
    submitReview
  };
}
