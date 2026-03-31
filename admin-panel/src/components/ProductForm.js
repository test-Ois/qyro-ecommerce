import ImageDropzone from "./ImageDropzone";

function ProductForm({
  name, setName,
  price, setPrice,
  category, setCategory,
  description, setDescription,
  stock, setStock,
  images, setImages,
  isBanner, setIsBanner,
  isSideBanner, setIsSideBanner,
  isDeal, setIsDeal,
  bannerType, setBannerType,
  currentImages = [],
  variants,
  setVariants
}) {
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        size: "",
        color: "",
        price: "",
        stock: "",
        sku: "",
        image: "",
        images: [] // Add images array for multiple images
      }
    ]);
  };

  const removeVariant = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
  };

  return (
    <>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <br /><br />

      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
        placeholder="Price"
        required
      />
      <br /><br />

      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        required
      />
      <br /><br />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <br /><br />

      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Stock Quantity"
        min="0"
        required
      />
      <br /><br />

      <ImageDropzone
        onImagesSelect={(newFiles, removeIndex) => {
          if (removeIndex !== undefined) {
            // Remove image at index
            setImages(prev => prev.filter((_, i) => i !== removeIndex));
          } else if (newFiles) {
            // Add new files
            setImages(prev => [...prev, ...newFiles]);
          }
        }}
        currentImages={currentImages}
      />

      <br />

      <label>
        Banner Position:
        <select
          value={bannerType}
          onChange={(e) => setBannerType(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="none">None</option>
          <option value="main">Main Banner</option>
          <option value="left">Left Side Banner</option>
          <option value="right">Right Side Banner</option>
        </select>
      </label>

      <br /><br />

      <label>
        <input
          type="checkbox"
          checked={isBanner}
          onChange={(e) => setIsBanner(e.target.checked)}
        />
        {" "}Big Banner
      </label>
      <br />

      <label>
        <input
          type="checkbox"
          checked={isSideBanner}
          onChange={(e) => setIsSideBanner(e.target.checked)}
        />
        {" "}Side Banner
      </label>
      <br />

      <label>
        <input
          type="checkbox"
          checked={isDeal}
          onChange={(e) => setIsDeal(e.target.checked)}
        />
        {" "}Deal Product
      </label>

      <br /><br />

      <div style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Variants</h4>
          <button type="button" onClick={addVariant}>
            + Add Variant
          </button>
        </div>

        {variants.map((variant, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "10px"
            }}
          >
            <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
              Variant {index + 1}
            </div>

            <input
              type="text"
              placeholder="Size"
              value={variant.size}
              onChange={(e) => handleVariantChange(index, "size", e.target.value)}
            />
            <br /><br />

            <input
              type="text"
              placeholder="Color"
              value={variant.color}
              onChange={(e) => handleVariantChange(index, "color", e.target.value)}
            />
            <br /><br />

            <input
              type="number"
              placeholder="Variant Price"
              value={variant.price}
              onChange={(e) => handleVariantChange(index, "price", e.target.value)}
            />
            <br /><br />

            <input
              type="number"
              placeholder="Variant Stock"
              value={variant.stock}
              onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
            />
            <br /><br />

            <input
              type="text"
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
            />
            <br /><br />

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Variant Images:
              </label>
              <ImageDropzone
                onImagesSelect={(newFiles, removeIndex) => {
                  const updatedVariants = [...variants];
                  if (removeIndex !== undefined) {
                    // Remove image at index
                    updatedVariants[index].images = updatedVariants[index].images.filter((_, i) => i !== removeIndex);
                  } else if (newFiles) {
                    // Add new files
                    updatedVariants[index].images = [
                      ...(updatedVariants[index].images || []),
                      ...newFiles
                    ];
                  }
                  setVariants(updatedVariants);
                }}
                currentImages={variant.images || []}
                maxImages={5}
              />
            </div>

            <button
              type="button"
              onClick={() => removeVariant(index)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default ProductForm;