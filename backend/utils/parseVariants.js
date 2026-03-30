/**
 * Parse and validate product variants
 * @param {string|array} variantsRaw - Raw variants data (JSON string or array)
 * @param {string} fallbackImage - Fallback image URL if variant image is missing
 * @returns {array} Parsed and normalized variants
 */
const parseVariants = (variantsRaw, fallbackImage = "") => {
  if (!variantsRaw) return [];

  let parsed = variantsRaw;

  if (typeof variantsRaw === "string") {
    try {
      parsed = JSON.parse(variantsRaw);
    } catch (error) {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.map((variant) => {
    const images = (variant.images || []).filter(
      (img) => img && (img.url || img.publicId)
    );

    return {
      size: (variant.size || "").trim(),
      color: (variant.color || "").trim(),
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
      image: (variant.image || fallbackImage || "").trim(), // Keep for backward compatibility
      images: images.length > 0 ? images : [], // Filter out empty/invalid images
      sku: (variant.sku || "").trim()
    };
  });
};

module.exports = parseVariants;
