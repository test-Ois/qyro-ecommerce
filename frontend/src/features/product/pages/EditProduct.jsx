import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../services/api";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const [variants, setVariants] = useState([
    { size: "", color: "", price: "", stock: "", sku: "" }
  ]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get("/seller/products");
        const product = res.data.find((item) => item._id === id);

        if (!product) {
          alert("Product not found");
          navigate("/seller-dashboard");
          return;
        }

        setName(product.name || "");
        setPrice(product.price || "");
        setDescription(product.description || "");
        setCategory(product.category || "");
        setStock(product.stock || "");

        // Handle images - prefer new images array, fallback to legacy image
        const productImages = product.images || [];
        const legacyImage = product.image;
        const allImages = productImages.length > 0 ? productImages :
          (legacyImage ? [{ url: legacyImage, type: "main" }] : []);

        setExistingImages(allImages);
        setPreviews(allImages.map(img => img.url));

        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((variant) => ({
              size: variant.size || "",
              color: variant.color || "",
              price: variant.price || "",
              stock: variant.stock || "",
              sku: variant.sku || ""
            }))
          );
        }
      } catch (error) {
        console.error("Fetch product error:", error);
        alert("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const addVariantField = () => {
    setVariants([
      ...variants,
      { size: "", color: "", price: "", stock: "", sku: "" }
    ]);
  };

  const removeVariantField = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(
      updatedVariants.length > 0
        ? updatedVariants
        : [{ size: "", color: "", price: "", stock: "", sku: "" }]
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 10 total images (existing + new)
    const totalCurrentImages = existingImages.length + images.length;
    const newFiles = files.slice(0, 10 - totalCurrentImages);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setImages(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    // Check if it's an existing image or newly uploaded
    const isExisting = index < existingImages.length;

    if (isExisting) {
      // Remove from existing images
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new images
      const newImageIndex = index - existingImages.length;
      setImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }

    setPreviews(prev => {
      // Revoke object URL if it's a new image
      if (!isExisting) {
        const newImagesStart = existingImages.length;
        if (index >= newImagesStart) {
          URL.revokeObjectURL(prev[index]);
        }
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const cleanedVariants = variants
        .filter(
          (variant) =>
            variant.size.trim() ||
            variant.color.trim() ||
            variant.price !== "" ||
            variant.stock !== "" ||
            variant.sku.trim()
        )
        .map((variant) => ({
          size: variant.size.trim(),
          color: variant.color.trim(),
          price: Number(variant.price) || 0,
          stock: Number(variant.stock) || 0,
          sku: variant.sku.trim()
        }));

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("variants", JSON.stringify(cleanedVariants));

      // Append new images
      images.forEach((img) => {
        formData.append("images", img);
      });

      await API.put(`/seller/products/${id}`, formData);

      alert("Product updated successfully ✅");
      navigate("/seller-dashboard");
    } catch (error) {
      console.error("Update product error:", error);
      alert(error?.response?.data?.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p style={{ padding: "20px", color: "white" }}>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-[#070014] px-4 py-8 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent tracking-wide">
              Edit Product
            </h1>
            <p className="text-gray-400 mt-2">
              Update product details and manage multiple variants.
            </p>
          </div>

          <button
            onClick={() => navigate("/seller-dashboard")}
            className="rounded-xl border border-purple-700/60 px-5 py-2 text-white hover:bg-purple-900/30 transition"
          >
            ← Back
          </button>
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
              className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />

            <div className="md:col-span-2 space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-yellow-400 file:via-pink-500 file:to-purple-600 file:px-4 file:py-2 file:text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Add more images (max 10 total). First image will be the main product image.
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input
                      type="text"
                      placeholder="Size"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                      className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    />

                    <input
                      type="text"
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                      className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    />

                    <input
                      type="number"
                      placeholder="Variant Price"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    />

                    <input
                      type="number"
                      placeholder="Variant Stock"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                      className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    />

                    <input
                      type="text"
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                      className="w-full rounded-xl border border-purple-800/50 bg-[#1a0933] px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-4 z-20 pt-2">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/seller-dashboard")}
                className="rounded-xl border border-gray-600 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition cursor-pointer disabled:opacity-60"
              >
                {submitting ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;