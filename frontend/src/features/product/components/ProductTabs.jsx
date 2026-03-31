import { useState } from "react";

export default function ProductTabs({ description }) {
  const [active, setActive] = useState("description");

  return (
    <div className="mt-6 border border-white/10 rounded-2xl bg-[#0f0a23] p-4 sm:p-5">
      <div className="mb-3 flex gap-3">
        <button
          onClick={() => setActive("description")}
          className={`rounded-full px-3 py-1 text-sm ${
            active === "description" ? "bg-pink-500 text-white" : "bg-white/10 text-gray-400"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActive("details")}
          className={`rounded-full px-3 py-1 text-sm ${
            active === "details" ? "bg-pink-500 text-white" : "bg-white/10 text-gray-400"
          }`}
        >
          Details
        </button>
      </div>

      <div className="text-sm text-gray-300">
        {active === "description" ? (
          <p>{description || "No description available."}</p>
        ) : (
          <div>
            <p>No extra details available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
