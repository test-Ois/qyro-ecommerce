export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(price) || 0);

export const getProductImage = (product) => {
  if (product?.image) {
    return product.image;
  }

  const firstImage = product?.images?.[0];

  if (typeof firstImage === "string") {
    return firstImage;
  }

  if (firstImage && typeof firstImage === "object") {
    return firstImage.url || "";
  }

  return "";
};
