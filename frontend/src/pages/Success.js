import { useNavigate } from "react-router-dom";

function Success() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="max-w-md w-full text-center bg-[#1a1035] border border-white/10 rounded-2xl p-8 shadow-2xl animate-slide-up">

        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-green-400"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.28-2.53a.75.75 0 1 0-1.06-1.06l-3.97 3.97-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5Z"
                clipRule="evenodd"
              />
            </svg>

          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold mb-2">
          Order Placed Successfully
        </h1>

        {/* SUBTEXT */}
        <p className="text-gray-400 text-sm mb-6">
          Thank you for your purchase. Your order is being processed.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3">

          <button
            onClick={() => navigate("/orders")}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:scale-105 transition"
          >
            View Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 rounded-full border border-white/10 text-gray-300 hover:bg-white/10 transition"
          >
            Continue Shopping
          </button>

        </div>

      </div>

    </div>
  );
}

export default Success;