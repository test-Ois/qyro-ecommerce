import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

function Dashboard() {

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0
  });

  // Revenue chart data state
  const [chartData, setChartData] = useState([]);

  // Top products state
  const [topProducts, setTopProducts] = useState([]);

  // Sales analytics state
  const [salesAnalytics, setSalesAnalytics] = useState({
    totalRevenue: 0,
    avgOrderValue: 0,
    bestMonth: "N/A",
    bestMonthRevenue: 0
  });

  /* Fetch dashboard stats (existing) */
  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  /* Fetch all orders and build monthly revenue chart data (existing) */
  const fetchRevenueData = async () => {
    try {
      const res = await API.get("/orders");
      const orders = res.data;

      // Group revenue by month name
      const monthlyMap = {};

      orders.forEach((order) => {
        const month = new Date(order.createdAt).toLocaleString("default", {
          month: "short",
        });
        monthlyMap[month] = (monthlyMap[month] || 0) + order.totalPrice;
      });

      // Convert to array for recharts
      const data = Object.entries(monthlyMap).map(([month, revenue]) => ({
        month,
        revenue,
      }));

      setChartData(data);

    } catch (error) {
      console.error("Revenue fetch error:", error);
    }
  };

  /* Fetch top 5 most ordered products (new) */
  const fetchTopProducts = async () => {
    try {
      const res = await API.get("/admin/top-products");
      setTopProducts(res.data);
    } catch (error) {
      console.error("Top products fetch error:", error);
    }
  };

  /* Fetch sales analytics data (new) */
  const fetchSalesAnalytics = async () => {
    try {
      const res = await API.get("/admin/sales-analytics");
      setSalesAnalytics(res.data);
    } catch (error) {
      console.error("Sales analytics fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRevenueData();
    fetchTopProducts();
    fetchSalesAnalytics();
  }, []);

  return (

    <div style={{ display: "flex" }}>

      <Sidebar />

      <div style={{ flex: 1 }}>

        <Navbar />

        <div style={{ padding: "20px" }}>

          <h1>Admin Dashboard</h1>

          {/* ===== EXISTING: Stat Cards ===== */}
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

            <div style={{
              padding: "20px", border: "1px solid #ddd",
              borderRadius: "8px", width: "200px"
            }}>
              <h3>Products</h3>
              <p>{stats.products}</p>
            </div>

            <div style={{
              padding: "20px", border: "1px solid #ddd",
              borderRadius: "8px", width: "200px"
            }}>
              <h3>Orders</h3>
              <p>{stats.orders}</p>
            </div>

            <div style={{
              padding: "20px", border: "1px solid #ddd",
              borderRadius: "8px", width: "200px"
            }}>
              <h3>Users</h3>
              <p>{stats.users}</p>
            </div>

          </div>

          {/* ===== NEW: Sales Analytics Cards ===== */}
          <div style={{ marginTop: "40px" }}>

            <h2>Sales Analytics</h2>

            <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>

              {/* Total Revenue */}
              <div style={{
                padding: "20px", borderRadius: "8px",
                background: "#4f46e5", color: "white", minWidth: "180px"
              }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Total Revenue</h4>
                <p style={{ fontSize: "22px", margin: 0, fontWeight: "bold" }}>
                  ₹{salesAnalytics.totalRevenue.toLocaleString()}
                </p>
              </div>

              {/* Average Order Value */}
              <div style={{
                padding: "20px", borderRadius: "8px",
                background: "#0891b2", color: "white", minWidth: "180px"
              }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Avg Order Value</h4>
                <p style={{ fontSize: "22px", margin: 0, fontWeight: "bold" }}>
                  ₹{salesAnalytics.avgOrderValue.toLocaleString()}
                </p>
              </div>

              {/* Best Month */}
              <div style={{
                padding: "20px", borderRadius: "8px",
                background: "#059669", color: "white", minWidth: "180px"
              }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Best Month</h4>
                <p style={{ fontSize: "18px", margin: 0, fontWeight: "bold" }}>
                  {salesAnalytics.bestMonth}
                </p>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>
                  ₹{salesAnalytics.bestMonthRevenue.toLocaleString()}
                </p>
              </div>

            </div>

          </div>

          {/* ===== EXISTING: Monthly Revenue Bar Chart ===== */}
          <div style={{ marginTop: "40px" }}>

            <h2>Monthly Revenue</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#4f46e5"
                  name="Revenue (₹)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* ===== NEW: Top Products Table ===== */}
          <div style={{ marginTop: "40px" }}>

            <h2>Top Products</h2>

            <table
              border="1"
              cellPadding="10"
              style={{ width: "100%", marginTop: "15px" }}
            >

              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Total Orders</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>

              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                      No data available
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.image}
                          alt={p.name}
                          width="50"
                          style={{ borderRadius: "4px" }}
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.totalOrders}</td>
                      <td>₹{p.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;