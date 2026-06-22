import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { Skeleton } from "../components/common/Skeleton";

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

  const [activeTab, setActiveTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "seller") {
      navigate("/");
      return;
    }

    fetchStats();
    fetchProducts();
    fetchOrders();
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

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await API.get("/orders/seller");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setOrdersLoading(false);
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
            <Skeleton className="w-56 h-8 mb-2 bg-white/10 animate-pulse" />
            <Skeleton className="w-96 h-4 bg-white/10 animate-pulse" />
          </div>
          <Skeleton className="w-36 h-10 rounded-xl bg-white/10 animate-pulse" />
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "30px"
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "20px 24px",
                borderRadius: "14px",
                minWidth: "180px",
                flex: 1
              }}
            >
              <Skeleton className="w-24 h-4 mb-3 bg-white/10 animate-pulse" />
              <Skeleton className="w-16 h-8 bg-white/10 animate-pulse" />
            </div>
          ))}
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
              marginBottom: "16px"
            }}
          >
            <Skeleton className="w-32 h-6 bg-white/10 animate-pulse" />
            <Skeleton className="w-20 h-6 rounded-full bg-white/10 animate-pulse" />
          </div>

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
                {[1, 2, 3, 4].map((i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <td style={tdStyle}>
                      <Skeleton className="w-14 h-14 rounded-lg bg-white/10 animate-pulse" />
                    </td>
                    <td style={tdStyle}>
                      <Skeleton className="w-32 h-4 bg-white/10 animate-pulse" />
                    </td>
                    <td style={tdStyle}>
                      <Skeleton className="w-12 h-4 bg-white/10 animate-pulse" />
                    </td>
                    <td style={tdStyle}>
                      <Skeleton className="w-12 h-4 bg-white/10 animate-pulse" />
                    </td>
                    <td style={tdStyle}>
                      <Skeleton className="w-20 h-4 bg-white/10 animate-pulse" />
                    </td>
                    <td style={tdStyle}>
                      <Skeleton className="w-8 h-4 bg-white/10 animate-pulse" />
                    </td>
                    <td style={tdStyle}>
                      <div className="flex gap-2">
                        <Skeleton className="w-14 h-8 rounded bg-white/10 animate-pulse" />
                        <Skeleton className="w-14 h-8 rounded bg-white/10 animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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
          onClick={() => navigate("/seller/products/add")}
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
        {/* TAB NAVIGATION */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
          <button
            onClick={() => setActiveTab("products")}
            style={{
              background: activeTab === "products" ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === "products" ? "#fbbf24" : "#a1a1aa",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              background: activeTab === "orders" ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === "orders" ? "#fbbf24" : "#a1a1aa",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            My Orders ({orders.length})
          </button>
        </div>

        {activeTab === "products" ? (
          <>
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
                  onClick={() => navigate("/seller/products/add")}
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
          </>
        ) : (
          <>
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
              <h3 style={{ margin: 0, fontSize: "22px" }}>Received Orders</h3>
            </div>

            {ordersLoading ? (
              <div style={{ padding: "30px 10px", textAlign: "center", color: "#a1a1aa" }}>
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: "30px 10px",
                  textAlign: "center",
                  color: "#a1a1aa"
                }}
              >
                <p style={{ fontSize: "16px" }}>No orders received yet.</p>
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
                      <th style={thStyle}>Order ID</th>
                      <th style={thStyle}>Customer</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Items</th>
                      <th style={thStyle}>Total Price</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((o) => {
                      const orderStatus = o.status || o.orderStatus || "Pending";
                      return (
                        <tr
                          key={o._id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.08)"
                          }}
                        >
                          <td style={tdStyle}>{o._id}</td>
                          <td style={tdStyle}>
                            <div>{o.user?.name || "Unknown"}</div>
                            <div style={{ fontSize: "12px", color: "#a1a1aa" }}>{o.user?.email}</div>
                          </td>
                          <td style={tdStyle}>
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {o.products?.map((item, index) => (
                                <div key={index} style={{ fontSize: "13px" }}>
                                  {item.name || item.product?.name || "Product"} (x{item.quantity})
                                  {item.size && <span style={{ color: "#a1a1aa", marginLeft: "4px" }}>Size: {item.size}</span>}
                                  {item.color && <span style={{ color: "#a1a1aa", marginLeft: "4px" }}>Color: {item.color}</span>}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={tdStyle}>₹{o.totalPrice}</td>
                          <td style={tdStyle}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background:
                                  orderStatus === "Delivered" ? "rgba(16,185,129,0.15)" :
                                  orderStatus === "Shipped" ? "rgba(59,130,246,0.15)" :
                                  orderStatus === "Cancelled" ? "rgba(239,68,68,0.15)" :
                                  "rgba(245,158,11,0.15)",
                                color:
                                  orderStatus === "Delivered" ? "#10b981" :
                                  orderStatus === "Shipped" ? "#3b82f6" :
                                  orderStatus === "Cancelled" ? "#ef4444" :
                                  "#f59e0b"
                              }}
                            >
                              {orderStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;