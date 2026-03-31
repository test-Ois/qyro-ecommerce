import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

function SellerDashboard() {
  const { user, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    commissionRate: 0,
    commissionAmount: 0,
    netEarnings: 0
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "seller") {
      navigate("/");
      return;
    }

    fetchStats();
    fetchProducts();
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/seller/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/seller/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/seller/products/${id}`);
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (authLoading || loading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "sans-serif",
        color: "white",
        minHeight: "100vh",
        background: "transparent"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700" }}>
            Seller Dashboard
          </h2>
          <p style={{ margin: "6px 0 0", color: "#a1a1aa" }}>
            Manage your products, track orders, and monitor earnings.
          </p>
        </div>

        <button
          onClick={() => navigate("/add-product")}
          style={{
            padding: "12px 22px",
            background: "linear-gradient(90deg, #facc15, #ec4899, #9333ea)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(236,72,153,0.25)"
          }}
        >
          + Add New Product
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "30px"
        }}
      >
        <div style={cardStyle("#4f46e5")}>
          <h4 style={cardHeading}>Total Products</h4>
          <p style={cardValue}>{stats.totalProducts}</p>
        </div>

        <div style={cardStyle("#0891b2")}>
          <h4 style={cardHeading}>Total Orders</h4>
          <p style={cardValue}>{stats.totalOrders}</p>
        </div>

        <div style={cardStyle("#059669")}>
          <h4 style={cardHeading}>Total Revenue</h4>
          <p style={cardValue}>₹{stats.totalRevenue}</p>
        </div>

        <div style={cardStyle("#d97706")}>
          <h4 style={cardHeading}>Commission ({stats.commissionRate}%)</h4>
          <p style={cardValue}>₹{stats.commissionAmount}</p>
        </div>

        <div style={cardStyle("#7c3aed")}>
          <h4 style={cardHeading}>Net Earnings</h4>
          <p style={cardValue}>₹{stats.netEarnings}</p>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "20px",
          backdropFilter: "blur(8px)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px"
          }}
        >
          <h3 style={{ margin: 0, fontSize: "22px" }}>My Products</h3>
          <span
            style={{
              fontSize: "13px",
              color: "#cbd5e1",
              background: "rgba(255,255,255,0.06)",
              padding: "6px 10px",
              borderRadius: "999px"
            }}
          >
            {products.length} products
          </span>
        </div>

        {products.length === 0 ? (
          <div
            style={{
              padding: "30px 10px",
              textAlign: "center",
              color: "#a1a1aa"
            }}
          >
            <p style={{ marginBottom: "12px", fontSize: "16px" }}>
              No products added yet.
            </p>
            <button
              onClick={() => navigate("/add-product")}
              style={{
                padding: "10px 18px",
                background: "linear-gradient(90deg, #facc15, #ec4899, #9333ea)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              cellPadding="10"
              style={{
                width: "100%",
                marginTop: "10px",
                borderCollapse: "collapse",
                color: "white"
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                  <th style={thStyle}>Image</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Stock</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Variants</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <td style={tdStyle}>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          width="56"
                          height="56"
                          style={{
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid rgba(255,255,255,0.08)"
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.05)",
                            color: "#a1a1aa",
                            fontSize: "12px"
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </td>

                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>₹{p.price}</td>

                    <td style={tdStyle}>
                      {p.stock}
                      {p.stock < 10 && (
                        <span
                          style={{
                            marginLeft: "8px",
                            background: "#dc2626",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px"
                          }}
                        >
                          Low Stock
                        </span>
                      )}
                    </td>

                    <td style={tdStyle}>{p.category}</td>
                    <td style={tdStyle}>{p.variants?.length || 0}</td>

                    <td style={tdStyle}>
                      <button
                        onClick={() => navigate(`/seller/products/edit/${p._id}`)}
                        style={{
                          padding: "6px 12px",
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          marginRight: "8px"
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(p._id)}
                        style={{
                          padding: "6px 12px",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = (bg) => ({
  background: bg,
  color: "white",
  padding: "20px 24px",
  borderRadius: "14px",
  minWidth: "180px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
});

const cardHeading = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "600",
  opacity: 0.95
};

const cardValue = {
  margin: "10px 0 0",
  fontSize: "28px",
  fontWeight: "700"
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  fontSize: "14px"
};

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
  verticalAlign: "middle"
};

export default SellerDashboard;