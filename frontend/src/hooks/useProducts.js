import { useCallback, useEffect, useState } from "react";
import { getAllProducts } from "../services/productService";

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setProducts([]);
      setError(requestError.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    error,
    fetchProducts,
    loading,
    products
  };
}

export default useProducts;
