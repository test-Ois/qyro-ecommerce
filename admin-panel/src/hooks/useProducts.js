import { useEffect, useMemo, useState } from "react";
import { deleteProduct, getProducts } from "../services/productService";
import { getAdminApiErrorMessage } from "../services/api";

const ITEMS_PER_PAGE = 6;

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProducts(debouncedSearchTerm);
        if (active) {
          setProducts(data);
        }
      } catch (requestError) {
        if (active) {
          setProducts([]);
          setError(getAdminApiErrorMessage(requestError, "Something went wrong while loading products."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [debouncedSearchTerm]);

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, products]);

  const removeProduct = async (productId) => {
    setDeletingId(productId);
    setError("");

    try {
      await deleteProduct(productId);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId)
      );
    } catch (requestError) {
      setError(getAdminApiErrorMessage(requestError, "Something went wrong while deleting the product."));
    } finally {
      setDeletingId("");
    }
  };

  return {
    currentPage,
    debouncedSearchTerm,
    deletingId,
    error,
    itemsPerPage: ITEMS_PER_PAGE,
    loading,
    paginatedProducts,
    products,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    totalPages,
    removeProduct
  };
}

export default useProducts;
