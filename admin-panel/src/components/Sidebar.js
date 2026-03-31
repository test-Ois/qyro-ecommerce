import { Link } from "react-router-dom";

function Sidebar() {

  return (

    <div style={{
      width: "220px",
      height: "100vh",
      background: "#111",
      color: "white",
      padding: "20px"
    }}>

      <h2>Qyro Admin</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>

        <li style={{ marginBottom: "12px" }}>
          <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
        </li>

        <li style={{ marginBottom: "12px" }}>
          <Link to="/products" style={{ color: "white" }}>Products</Link>
        </li>

        <li style={{ marginBottom: "12px" }}>
          <Link to="/orders" style={{ color: "white" }}>Orders</Link>
        </li>

        {/* NEW: Sellers management link */}
        <li style={{ marginBottom: "12px" }}>
          <Link to="/sellers" style={{ color: "white" }}>Sellers</Link>
        </li>

      </ul>

    </div>

  );

}

export default Sidebar;