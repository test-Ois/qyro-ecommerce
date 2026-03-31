import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white px-6 py-6">

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400 hover:text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-wide">
            Your Cart
          </h1>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-yellow-400"
          >
            <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
          </svg>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className="text-2xl font-semibold mb-2">Your cart is empty</p>
          <p className="text-gray-400 mb-4">Add something to get started</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-700 transition"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.selectedVariant?.sku ? `${item._id}-${item.selectedVariant.sku}` : `${item._id}-${index}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />

                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase">
                    {item.category}
                  </p>

                  <h3 className="font-semibold">{item.name}</h3>

                  <p className="text-purple-400 font-bold">
                    ₹{item.price}
                  </p>

                  {item.selectedVariant && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.selectedVariant.size && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300">
                          Size: {item.selectedVariant.size}
                        </span>
                      )}

                      {item.selectedVariant.color && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300">
                          Color: {item.selectedVariant.color}
                        </span>
                      )}

                      {item.selectedVariant.sku && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300">
                          SKU: {item.selectedVariant.sku}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() =>
  removeFromCart(
    item._id,
    "decrease",
    item.selectedVariant?.sku || "",
    item.selectedVariant?.size || "",
    item.selectedVariant?.color || ""
  )
}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() =>
  removeFromCart(
    item._id,
    "remove",
    item.selectedVariant?.sku || "",
    item.selectedVariant?.size || "",
    item.selectedVariant?.color || ""
  )
}
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
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md h-fit sticky top-20">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-yellow-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3h16.5M4.5 6h15l-1.5 12h-12L4.5 6Z"
                />
              </svg>

              <span className="tracking-wide">Order Summary</span>
            </h2>

            <div className="flex justify-between text-sm mb-2">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span>Total Price</span>
              <span>₹{totalPrice}</span>
            </div>

            <div className="flex items-center gap-2 text-xs mb-4 text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>

              <span className="font-medium tracking-wide">
                Free delivery unlocked
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 rounded-full 
              bg-gradient-to-r from-yellow-400 to-yellow-600
              hover:from-yellow-500 hover:to-yellow-700
              hover:scale-[1.03] active:scale-95
              transition-all duration-300 
              font-semibold text-black
              shadow-md hover:shadow-xl
              flex items-center justify-center gap-2 group"
            >
              <span className="tracking-wide">
                Proceed to Checkout
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 group-hover:translate-x-1 transition"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;