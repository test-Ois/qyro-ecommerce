import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

function Sellers() {

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSellers(); }, []);

  /* Fetch all sellers from backend */
  const fetchSellers = async () => {
    try {
      const res = await API.get("/admin/sellers");
      setSellers(res.data);
    } catch (error) {
      console.error("Fetch sellers error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* Approve seller */
  const approveSeller = async (id) => {
    try {
      await API.put(`/admin/sellers/${id}/approve`);
      fetchSellers();
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  /* Reject seller */
  const rejectSeller = async (id) => {
    try {
      await API.put(`/admin/sellers/${id}/reject`);
      fetchSellers();
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  /* Update commission rate */
  const updateCommission = async (id, rate) => {
    try {
      await API.put(`/admin/sellers/${id}/commission`, {
        commissionRate: Number(rate)
      });
      alert("Commission updated ✅");
      fetchSellers();
    } catch (error) {
      console.error("Commission update error:", error);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading sellers...</p>;

  return (

    <div style={{ display: "flex" }}>

      <Sidebar />

      <div style={{ flex: 1 }}>

        <Navbar />

        <div style={{ padding: "20px" }}>

          <h2>Sellers Management</h2>

          {sellers.length === 0 ? (
            <p style={{ color: "#888", marginTop: "20px" }}>
              No seller applications found.
            </p>
          ) : (

            <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>

              <thead style={{ background: "#f3f4f6" }}>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Shop Name</th>
                  <th>Status</th>
                  <th>Commission %</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller._id}>

                    <td>{seller.name}</td>
                    <td>{seller.email}</td>
                    <td>{seller.shopName || "N/A"}</td>

                    {/* Approval status badge */}
                    <td>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: seller.isApproved ? "#d1fae5" : "#fef3c7",
                        color: seller.isApproved ? "#065f46" : "#92400e"
                      }}>
                        {seller.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    {/* Commission rate input */}
                    <td>
                      <input
                        type="number"
                        defaultValue={seller.commissionRate}
                        min="0"
                        max="100"
                        style={{ width: "60px", padding: "4px" }}
                        onBlur={(e) => updateCommission(seller._id, e.target.value)}
                      />
                      %
                    </td>

                    {/* Action buttons */}
                    <td style={{ display: "flex", gap: "8px" }}>

                      {!seller.isApproved && (
                        <button
                          onClick={() => approveSeller(seller._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#059669",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                        >
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => rejectSeller(seller._id)}
                        style={{
                          padding: "6px 12px",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Reject
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );

}

export default Sellers;