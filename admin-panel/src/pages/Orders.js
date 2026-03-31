import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

// Color mapping for order status badges
const STATUS_COLORS = {
  Pending:   { background: "#fef3c7", color: "#92400e" },
  Shipped:   { background: "#dbeafe", color: "#1e40af" },
  Delivered: { background: "#d1fae5", color: "#065f46" },
  Cancelled: { background: "#fee2e2", color: "#991b1b" }
};

function Orders() {

  const [orders, setOrders] = useState([]);

  /* Fetch all orders */
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* UPDATE STATUS (existing logic — unchanged) */
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (

    <div style={{ display: "flex" }}>

      <Sidebar />

      <div style={{ flex: 1 }}>

        <Navbar />

        <div style={{ padding: "20px" }}>

          <h1>Orders</h1>

          <table border="1" cellPadding="10" style={{ width: "100%" }}>

            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                {/* NEW: Status badge column */}
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => (
                <tr key={order._id}>

                  <td>{order._id}</td>

                  <td>{order.user?.name}</td>

                  <td>₹{order.totalPrice}</td>

                  {/* NEW: Colored status badge */}
                  <td>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 600,
                      ...STATUS_COLORS[order.status]
                    }}>
                      {order.status || "Pending"}
                    </span>
                  </td>

                  {/* Existing status dropdown — unchanged */}
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
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

export default Orders;