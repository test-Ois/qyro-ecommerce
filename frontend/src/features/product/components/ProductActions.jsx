import Button from "../../../components/common/Button";

export default function ProductActions({ displayStock, variantRequired, disabled, onAdd }) {
  const isDisabled = disabled || variantRequired;

  let stockStatus = "In stock";
  let stockHint = "";

  if (displayStock <= 0) {
    stockStatus = "Out of stock";
    stockHint = "This variant is currently unavailable.";
  } else if (displayStock > 0 && displayStock <= 10) {
    stockStatus = `Only ${displayStock} left`;
    stockHint = "Hurry, limited quantity remaining.";
  } else {
    stockStatus = "In stock";
    stockHint = "Available for immediate dispatch.";
  }

  return (
    <div className="mt-7">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-300">Stock</p>
          <p className={`text-sm font-bold ${displayStock > 0 ? "text-white" : "text-red-400"}`}>
            {stockStatus}
          </p>
          {stockHint && <p className="text-xs text-gray-400">{stockHint}</p>}
        </div>
        <div className={`h-2 w-2 rounded-full ${displayStock > 0 ? "bg-emerald-400" : "bg-red-500"}`} />
      </div>

      <div className="mt-4">
        <Button
          onClick={onAdd}
          disabled={isDisabled}
          className={isDisabled ? "w-full rounded-2xl px-6 py-3.5 text-sm font-bold bg-gray-700 text-gray-400" : "w-full rounded-2xl px-6 py-3.5 text-sm font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white shadow-lg hover:scale-[1.02]"}
        >
          {displayStock < 1 ? "Out of Stock" : variantRequired ? "Select Variant" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
