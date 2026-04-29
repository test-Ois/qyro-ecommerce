import API from "./api";

export const getProducts = async (keyword = "") => {
  const { data } = await API.get("/products", {
    params: keyword ? { keyword } : {}
  });

  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

export const deleteProduct = (productId) => API.delete(`/products/${productId}/admin`);
