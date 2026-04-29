import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";

const inputClass =
  "w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20";

const createVariant = () => ({
  size: "",
  color: "",
  price: "",
  stock: "",
  sku: "",
  images: []
});

function AddProduct() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const [variants, setVariants] = useState([
    { size: "", color: "", price: "", stock: "", sku: "", images: [] }
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const handleVariantImages = (index, files) => {
    const updatedVariants = [...variants];
    updatedVariants[index].images = Array.from(files || []);
    setVariants(updatedVariants);
  };

  const addVariantField = () => {
    setVariants([...variants, createVariant()]);
  };

  const removeVariantField = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants.length > 0 ? updatedVariants : [createVariant()]);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const newFiles = files.slice(0, Math.max(0, 10 - images.length));
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setName("");
    setPrice("");
    setDescription("");
    setCategory("");
    setStock("");
    setImages([]);
    setPreviews([]);
    setVariants([createVariant()]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (images.length === 0) {
        alert("At least one product image is required");
        return;
      }

      const cleanedVariants = variants
        .filter(
          (variant) =>
            variant.size.trim() ||
            variant.color.trim() ||
            variant.price !== "" ||
            variant.stock !== "" ||
            variant.sku.trim() ||
            variant.images.length > 0
        )
        .map((variant, index) => {
          const variantPrice = Number(variant.price);
          const variantStock = Number(variant.stock || 0);

          if (!Number.isFinite(variantPrice) || variantPrice < 0) {
            throw new Error(`Variant ${index + 1} price must be valid.`);
          }

          if (!Number.isFinite(variantStock) || variantStock < 0) {
            throw new Error(`Variant ${index + 1} stock must be valid.`);
          }

          return {
            size: variant.size.trim(),
            color: variant.color.trim(),
            price: variantPrice,
            stock: variantStock,
            sku: variant.sku.trim(),
            images: []
          };
        });

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      formData.append("description", description.trim());
      formData.append("category", category.trim());
      formData.append("stock", stock);
      images.forEach((img) => {
        formData.append("images", img);
      });
      formData.append("variants", JSON.stringify(cleanedVariants));

      variants.forEach((variant, index) => {
        variant.images.forEach((file) => {
          formData.append(`variantImages_${index}`, file);
        });
      });

      await API.post("/seller/products", formData);

      alert("Product added successfully ✅");
      resetForm();
      navigate("/seller-dashboard");
    } catch (error) {
      console.error("Add product error:", error);
      alert(error?.response?.data?.message || error.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070014] px-4 py-8 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent tracking-wide">
            Add New Product
          </h1>
          <p className="text-gray-400 mt-2">
            Create product and add multiple variants like size, color, stock and SKU.
          </p>
        </div>

        <form
          onSubmit={submitHandler}
          className="bg-[#120422] border border-purple-900/40 rounded-2xl p-6 md:p-8 shadow-xl space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />

            <input
              type="number"
              placeholder="Base Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 md:col-span-2"
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />

            <input
              type="number"
              placeholder="Total Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min="0"
              className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />

            <div className="md:col-span-2 space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  required={images.length === 0}
                  className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-yellow-400 file:via-pink-500 file:to-purple-600 file:px-4 file:py-2 file:text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Select multiple images (max 10). First image will be the main product image.
                </p>
              </div>

              {previews.length > 0 && (
                <div className="rounded-2xl border border-purple-800/50 bg-[#0d021c] p-4">
                  <p className="text-sm text-gray-400 mb-3">Image Previews ({previews.length}/10)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl border border-purple-900/50"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="text-xl font-semibold text-white">Variants</h3>

              <button
                type="button"
                onClick={addVariantField}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] transition"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-5">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-purple-900/50 bg-[#0d021c] p-5"
                >
                  <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <h4 className="text-white font-medium">Variant {index + 1}</h4>

                    <button
                      type="button"
                      onClick={() => removeVariantField(index)}
                      className="text-sm font-medium text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <input
                      type="text"
                      placeholder="Size"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                      className={inputClass}
                    />

                    <input
                      type="text"
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                      className={inputClass}
                    />

                    <input
                      type="number"
                      placeholder="Variant Price"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      className={inputClass}
                    />

                    <input
                      type="number"
                      placeholder="Variant Stock"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                      className={inputClass}
                    />

                    <input
                      type="text"
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-300">Variant Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleVariantImages(index, e.target.files)}
                      className="mt-2 w-full rounded-xl border border-dashed border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-purple-600 file:px-4 file:py-2 file:text-white"
                    />

                    {variant.images.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {variant.images.map((file, imageIndex) => (
                          <img
                            key={`${file.name}-${imageIndex}`}
                            src={URL.createObjectURL(file)}
                            alt={`Variant ${index + 1} ${imageIndex + 1}`}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-4 z-20 pt-2">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
