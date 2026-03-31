export default function ProductVariants({ sizes, colors, selectedSize, selectedColor, availableSizes, availableColors, onSelectSize, onSelectColor }) {
  return (
    <>
      {sizes.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white sm:text-base">Select Size</h3>
            {selectedSize && (
              <button
                type="button"
                onClick={() => onSelectSize("")}
                className="text-xs text-pink-400 hover:text-pink-300"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const disabled = selectedColor && !availableSizes.includes(size);
              const active = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => !disabled && onSelectSize(size)}
                  disabled={disabled}
                  className={`min-w-[52px] rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "border-pink-500 bg-pink-500/15 text-white shadow-[0_0_0_1px_rgba(236,72,153,0.35)]"
                      : "border-white/10 bg-white/5 text-white hover:border-pink-400/60 hover:bg-white/10"
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white sm:text-base">Select Color</h3>
            {selectedColor && (
              <button
                type="button"
                onClick={() => onSelectColor("")}
                className="text-xs text-pink-400 hover:text-pink-300"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => {
              const disabled = selectedSize && !availableColors.includes(color);
              const active = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => !disabled && onSelectColor(color)}
                  disabled={disabled}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition ${
                    active
                      ? "border-pink-500 bg-pink-500/15 text-white shadow-[0_0_0_1px_rgba(236,72,153,0.35)]"
                      : "border-white/10 bg-white/5 text-white hover:border-pink-400/60 hover:bg-white/10"
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
