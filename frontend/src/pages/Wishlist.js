import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

function Wishlist() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  document.title = "Qyro - My Wishlist";
}, []);

  /* Redirect to login if not logged in */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user]);

  /* Fetch wishlist products from backend */
  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setWishlist(res.data);
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* Remove product from wishlist */
  const removeFromWishlist = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error("Remove wishlist error:", error);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading wishlist...</p>;

  return (
    <div style={{ padding: "20px" }}>

      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <span>My Wishlist</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-pink-500 hover:scale-110 transition"
        >
          <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
        </svg>
      </h2>

      {wishlist.length === 0 ? (

        <p style={{ color: "#888", marginTop: "20px" }}>
          Your wishlist is empty. Start adding products!
        </p>

      ) : (

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px"
        }}>

          {wishlist.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate("/checkout", { state: { product } })}  // ✅ ADDED
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
                width: "200px",
                cursor: "pointer" // ✅ ADDED
              }}
            >

              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "6px"
                }}
              />

              <h4 style={{ margin: "10px 0 4px" }}>{product.name}</h4>

              <p style={{ color: "#4f46e5", fontWeight: "bold" }}>
                ₹{product.price}
              </p>

              <button
                onClick={(e) => {   // ✅ UPDATED
                  e.stopPropagation();
                  removeFromWishlist(product._id);
                }}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  padding: "6px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Remove ❌
              </button>

            </div>
          ))}

        </div>

      )}

    </div>
  );

}

export default Wishlist;