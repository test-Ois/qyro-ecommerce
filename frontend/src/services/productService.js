import API from "./api";

export const getAllProducts = async () => {
  const response = await API.get(`/products`);
  return response.data;
};

export const getProduct = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const getRelatedProducts = async (category, excludeId) => {
  if (!category) return [];

  const response = await API.get(`/products?category=${encodeURIComponent(category)}`);
  if (!Array.isArray(response.data)) return [];

  return response.data
    .filter((item) => item._id !== excludeId)
    .slice(0, 8);
};
