import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

function Checkout() {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const computedTotal = (cart || []).reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const finalTotal = computedTotal >= 499 ? computedTotal : computedTotal + 49;

  const placeOrder = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    if (!token || token === "null") {
      alert("Please login first");
      navigate("/login");
      setLoading(false);
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Your cart is empty");
      setLoading(false);
      return;
    }

    try {
      if (paymentMethod === "ONLINE") {
        // Simulate online payment delay (Replace with real Razorpay implementation in production)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockPaymentDetails = {
          razorpay_payment_id: "pay_dummy_" + Math.random().toString(36).substring(2, 11),
          razorpay_order_id: "order_dummy_" + Math.random().toString(36).substring(2, 11),
          razorpay_signature: "dummy_sig_" + Math.random().toString(36).substring(2, 11)
        };

        const res = await fetch(`${apiBase}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            products: cart.map(item => ({
              product: item._id,
              quantity: item.quantity,
              variantId: item.selectedVariant?._id || "",
              size: item.selectedVariant?.size || "",
              color: item.selectedVariant?.color || ""
            })),
            totalPrice: finalTotal,
            paymentMethod: "ONLINE",
            paymentDetails: mockPaymentDetails
          })
        });

        const data = await res.json();

        if (res.ok) {
          clearCart();
          navigate("/success");
        } else {
          alert(data.message || "Simulated payment verification failed");
        }
      } else {
        // COD path
        const res = await fetch(`${apiBase}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            products: cart.map(item => ({
              product: item._id,
              quantity: item.quantity,
              variantId: item.selectedVariant?._id || "",
              size: item.selectedVariant?.size || "",
              color: item.selectedVariant?.color || ""
            })),
            totalPrice: finalTotal,
            paymentMethod: "COD"
          })
        });

        const data = await res.json();

        if (res.ok) {
          clearCart();
          navigate("/success");
        } else {
          alert(data.message || "Order placement failed");
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white">
      {/* HEADER */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-yellow-400/10 transition group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 group-hover:scale-110 transition"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {/* ICON */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-yellow-400"
          >
            <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
            <path
              fillRule="evenodd"
              d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
              clipRule="evenodd"
            />
          </svg>

          {/* TEXT */}
          <h1 className="text-xl font-semibold tracking-wide">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold mb-5">
            Order Items ({cart?.length || 0})
          </h3>

          <div className="space-y-4">
            {(cart || []).map(item => {
              const sku = item.selectedVariant?.sku || "";
              const size = item.selectedVariant?.size || "";
              const color = item.selectedVariant?.color || "";
              return (
                <div
                  key={`${item._id}-${sku}-${size}-${color}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 
                  backdrop-blur-md hover:bg-white/10 hover:scale-[1.01] transition-all duration-300"
                >
                  {/* IMAGE */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl border border-white/10"
                  />

                  {/* DETAILS */}
                  <div className="flex-1">
                    <p className="text-xs text-yellow-400 uppercase tracking-wide">
                      {item.category}
                    </p>
                    <p className="font-semibold">{item.name}</p>
                    {size && <span className="text-xs text-gray-400 mr-3">Size: {size}</span>}
                    {color && <span className="text-xs text-gray-400">Color: {color}</span>}
                    <p className="text-xs text-gray-400 mt-1">
                      ₹{item.price} x {item.quantity}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item._id, "dec", sku, size, color)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-yellow-400/20 hover:text-yellow-400 transition"
                      >
                        -
                      </button>

                      <span className="text-sm font-semibold">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item._id, "inc", sku, size, color)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-yellow-400/20 hover:text-yellow-400 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* DELETE */}
                  <button
                    onClick={() => removeFromCart(item._id, "remove", sku, size, color)}
                    className="p-2 rounded-full hover:bg-red-500/10 transition group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:scale-110 transition"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-24 
        backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.03)]">
          <h3 className="text-lg font-semibold mb-5">Order Summary</h3>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>₹{computedTotal}</span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Delivery</span>
              <span className={computedTotal >= 499 ? "text-green-400" : ""}>
                {computedTotal >= 499 ? "FREE" : "₹49"}
              </span>
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg text-yellow-400">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          {/* DELIVERY STATUS */}
          {computedTotal < 499 && (
            <div className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-2 rounded-lg mb-6">
              Add ₹{499 - computedTotal} more for FREE delivery 🚚
            </div>
          )}

          {computedTotal >= 499 && (
            <div className="flex items-center gap-2 text-xs bg-green-500/10 text-green-400 px-3 py-2 rounded-lg mb-6 border border-green-500/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-medium">
                Free delivery unlocked
              </span>
            </div>
          )}

          {/* PAYMENT METHOD SELECTOR */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-400 mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Card Payment Option */}
              <div
                onClick={() => setPaymentMethod("ONLINE")}
                className={`cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${
                  paymentMethod === "ONLINE"
                    ? "border-yellow-400 bg-yellow-400/10 text-white shadow-[0_0_12px_rgba(234,179,8,0.15)]"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-6 h-6 mb-1.5 ${paymentMethod === "ONLINE" ? "text-yellow-400" : "text-gray-400"}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.25-12h10.5A2.25 2.25 0 0 1 18 5.25v13.5A2.25 2.25 0 0 1 15.75 21H3.75A2.25 2.25 0 0 1 1.5 18.75V5.25A2.25 2.25 0 0 1 3.75 3h10.5"
                  />
                </svg>
                <span className="text-xs font-semibold">Pay Online</span>
              </div>

              {/* COD Option */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${
                  paymentMethod === "COD"
                    ? "border-yellow-400 bg-yellow-400/10 text-white shadow-[0_0_12px_rgba(234,179,8,0.15)]"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-6 h-6 mb-1.5 ${paymentMethod === "COD" ? "text-yellow-400" : "text-gray-400"}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125a1.125 1.125 0 0 0 1.125-1.125V9.75M8.25 18.75h6M12 5.25v13.5M3 14.25h18"
                  />
                </svg>
                <span className="text-xs font-semibold">COD</span>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={placeOrder}
            disabled={loading}
            className={`relative w-full py-3 rounded-full font-semibold text-black 
            bg-gradient-to-r from-yellow-400 to-yellow-600 
            overflow-hidden group transition-all duration-300 
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.03] active:scale-95"}`}
          >
            {/* SHINE EFFECT */}
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition duration-300 blur-xl"></span>

            {/* CONTENT */}
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                  <span className="ml-2 font-medium">Processing</span>
                </>
              ) : (
                <>
                  {paymentMethod === "ONLINE" ? "Pay & Place Order (Mock)" : "Place Order (COD)"}
                  {/* ARROW */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 group-hover:scale-110 transition"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6Z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Zm9.586 4.594a.75.75 0 0 0-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.116-.062l3-3.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </span>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 text-green-400"
            >
              <path
                fillRule="evenodd"
                d="M8.5 1.709a.75.75 0 0 0-1 0 8.963 8.963 0 0 1-4.84 2.217.75.75 0 0 0-.654.72 10.499 10.499 0 0 0 5.647 9.672.75.75 0 0 0 .694-.001 10.499 10.499 0 0 0 5.647-9.672.75.75 0 0 0-.654-.719A8.963 8.963 0 0 1 8.5 1.71Zm2.34 5.504a.75.75 0 0 0-1.18-.926L7.394 9.17l-1.156-.99a.75.75 0 1 0-.976 1.138l1.75 1.5a.75.75 0 0 0 1.078-.106l2.75-3.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span> Secure Checkout (Dummy Integration)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
