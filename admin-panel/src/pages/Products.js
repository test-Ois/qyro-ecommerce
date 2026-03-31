import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProductTable from "../components/ProductTable";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import API from "../services/api";

function Products() {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const [editingProduct, setEditingProduct] = useState(null);

  // ✅ NEW
  const [showAddModal, setShowAddModal] = useState(false);

  const LOW_STOCK_LIMIT = 10;

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const start = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(start, start + limit);
  const totalPages = Math.ceil(filteredProducts.length / limit);

  const lowStockProducts = products.filter(p => p.stock < LOW_STOCK_LIMIT);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: "20px" }}>

          {/* ✅ BUTTON */}
          <button onClick={() => setShowAddModal(true)}>
            + Add Product
          </button>

          {/* ✅ MODAL */}
          {showAddModal && (
            <AddProductModal
              fetchProducts={fetchProducts}
              onClose={() => setShowAddModal(false)}
            />
          )}

          <br />

          {lowStockProducts.length > 0 && (
            <div style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#92400e"
            }}>
              ⚠️ {lowStockProducts.length} product(s) have low stock
            </div>
          )}

          <input
            placeholder="Search product..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: "10px", width: "250px", marginBottom: "20px" }}
          />

          <ProductTable
            products={paginatedProducts}
            deleteProduct={deleteProduct}
            editProduct={editProduct}
          />

          <br />

          <button onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</button>
          <span> Page {page} of {totalPages} </span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>

          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            fetchProducts={fetchProducts}
          />

        </div>
      </div>
    </div>
  );
}

export default Products;