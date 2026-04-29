import { useNavigate } from "react-router-dom";
import AdminCard from "../components/common/AdminCard";
import AdminButton from "../components/common/AdminButton";
import AdminInput from "../components/common/AdminInput";
import useProducts from "../hooks/useProducts";
import { formatPrice, getProductImage } from "../utils/productUtils";

function Products() {
  const navigate = useNavigate();
  const {
    currentPage,
    debouncedSearchTerm,
    deletingId,
    error,
    itemsPerPage,
    loading,
    paginatedProducts,
    products,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    totalPages,
    removeProduct
  } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">
            Products
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Products management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Curate the catalog, search listings quickly, and manage products without leaving the admin flow.
          </p>
        </div>

        <AdminButton
          onClick={() => navigate("/add-product")}
        >
          Add Product
        </AdminButton>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard className="p-5">
          <p className="text-sm text-gray-300">Total Products</p>
          <p className="mt-3 text-4xl font-extrabold text-white">{loading ? "..." : products.length}</p>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-sm text-gray-300">Search Results</p>
          <p className="mt-3 text-4xl font-extrabold text-indigo-100">
            {loading ? "..." : products.length}
          </p>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-sm text-gray-300">Current Page</p>
          <p className="mt-3 text-4xl font-extrabold text-pink-100">
            {loading ? "..." : currentPage}
          </p>
        </AdminCard>
      </div>

      <AdminCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Search Catalog
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Search products by name with a debounced backend query.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <AdminInput
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
            />
          </div>
        </div>
      </AdminCard>

      {loading ? (
        <AdminCard className="overflow-hidden">
          <div className="space-y-3 p-6">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
          </div>
        </AdminCard>
      ) : products.length === 0 ? (
        <AdminCard className="p-10 text-center">
          <h2 className="text-2xl font-bold text-white">
            {debouncedSearchTerm ? "No matching products" : "No products found"}
          </h2>
          <p className="mt-3 text-sm text-gray-300">
            {!debouncedSearchTerm
              ? "Start by creating your first product and it will appear here instantly."
              : "Try a different search term to widen the results."}
          </p>
          {!debouncedSearchTerm && (
            <div className="mt-6">
              <AdminButton
                onClick={() => navigate("/add-product")}
              >
                Create First Product
              </AdminButton>
            </div>
          )}
        </AdminCard>
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white">
              <thead className="bg-black/20 text-xs uppercase tracking-[0.24em] text-gray-300">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedProducts.map((product) => (
                  <tr key={product._id} className="bg-white/[0.03]">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)}
                            alt={product.name || "Product"}
                            className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-xs text-gray-400">
                            No Img
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-white">
                            {product.name || "Untitled Product"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.description || "No description added yet."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top font-medium text-pink-200">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-3">
                        <AdminButton
                          variant="secondary"
                          onClick={() => navigate(`/edit-product/${product._id}`)}
                        >
                          Edit
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          onClick={() => removeProduct(product._id)}
                          disabled={deletingId === product._id}
                        >
                          {deletingId === product._id ? "Deleting..." : "Delete"}
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-300">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, products.length)} of{" "}
              {products.length} products
            </p>

            <div className="flex flex-wrap gap-3">
              <AdminButton
                variant="secondary"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </AdminButton>
              <div className="flex items-center rounded-xl border border-white/10 bg-black/10 px-4 py-2 text-sm text-white">
                Page {currentPage} of {totalPages}
              </div>
              <AdminButton
                variant="secondary"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

export default Products;
