import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageCropModal from "../components/ImageCropModal";
import API from "../services/api";
import { createCropImageUrl } from "../utils/cropImage";

const panelClass =
  "rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl";
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-300 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30";
const fileInputClass =
  "block w-full rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-gray-200 file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-white/30";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50";
const removeButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition duration-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50";
const variantCardClass =
  "bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-xl";

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
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [cropSource, setCropSource] = useState("");
  const [cropFileName, setCropFileName] = useState("product-image.jpg");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  }, [imagePreviewUrl]);

  const handleVariantChange = (index, field, value) => {
    setVariants((currentVariants) =>
      currentVariants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleVariantImages = (index, files) => {
    const updated = [...variants];
    updated[index].images = Array.from(files || []);
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants((currentVariants) => [...currentVariants, createVariant()]);
  };

  const removeVariant = (index) => {
    setVariants((currentVariants) =>
      currentVariants.filter((_, variantIndex) => variantIndex !== index)
    );
  };

  const handleMainImageSelect = async (event) => {
    const selectedFile = event.target.files?.[0] || null;
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    try {
      const nextCropSource = await createCropImageUrl(selectedFile);
      setCropFileName(selectedFile.name || "product-image.jpg");
      setCropSource(nextCropSource);
      setIsCropModalOpen(true);
    } catch (cropError) {
      setError(cropError.message || "Failed to open the image cropper.");
    }
  };

  const handleCropCancel = () => {
    setCropSource("");
    setIsCropModalOpen(false);
  };

  const handleCropConfirm = (croppedFile) => {
    setImage((currentImage) => {
      if (currentImage && imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      return croppedFile;
    });

    const nextPreviewUrl = URL.createObjectURL(croppedFile);
    setImagePreviewUrl(nextPreviewUrl);
    setCropSource("");
    setIsCropModalOpen(false);
    setError("");
  };

  const clearSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImage(null);
    setImagePreviewUrl("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const preparedVariants = variants
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
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("variants", JSON.stringify(preparedVariants));

      if (image) {
        formData.append("image", image);
      }

      variants.forEach((variant, index) => {
        variant.images.forEach((file) => {
          formData.append(`variantImages_${index}`, file);
        });
      });

      await API.post("/products/admin", formData);
      navigate("/products");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while adding the product."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">
          Products
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          Add new product
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
          Create a new catalog item with multiple priced variants and image sets.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className={`${panelClass} p-6 sm:p-8`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-200">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className={inputClass}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-gray-200">
                Base Price
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
                className={inputClass}
                placeholder="Enter base product price"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-200">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="6"
              className={`${inputClass} resize-none`}
              placeholder="Write a short product description"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium text-gray-200">
              Main Product Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleMainImageSelect}
              className={fileInputClass}
            />
            <p className="text-xs text-gray-400">
              Select an image, crop it, preview it, and then upload the cropped version.
            </p>
            {imagePreviewUrl && (
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-200">Cropped Preview</p>
                    <p className="mt-1 text-xs text-gray-400">
                      This cropped image will be uploaded as the main product image.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className={removeButtonClass}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img
                    src={imagePreviewUrl}
                    alt="Cropped product preview"
                    className="h-64 w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label className="text-sm font-medium text-gray-200">Variants</label>
                <p className="mt-1 text-xs text-gray-400">
                  Add size, color, price, stock, SKU, and multiple images for each variant.
                </p>
              </div>

              <button type="button" onClick={addVariant} className={primaryButtonClass}>
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className={`${variantCardClass} text-sm text-gray-300`}>
                No variants added yet. You can still create the product with the main product data only.
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={`variant-${index}`} className={variantCardClass}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-200">
                            Size
                          </label>
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(event) =>
                              handleVariantChange(index, "size", event.target.value)
                            }
                            className={inputClass}
                            placeholder="Enter size"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-200">
                            Color
                          </label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(event) =>
                              handleVariantChange(index, "color", event.target.value)
                            }
                            className={inputClass}
                            placeholder="Enter color"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-200">
                            Variant Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(event) =>
                              handleVariantChange(index, "price", event.target.value)
                            }
                            className={inputClass}
                            placeholder="Enter variant price"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-200">
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(event) =>
                              handleVariantChange(index, "stock", event.target.value)
                            }
                            className={inputClass}
                            placeholder="Enter stock"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-200">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(event) =>
                              handleVariantChange(index, "sku", event.target.value)
                            }
                            className={inputClass}
                            placeholder="Enter SKU"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2 xl:col-span-5">
                          <label className="text-sm font-medium text-gray-200">
                            Variant Images
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(event) =>
                              handleVariantImages(index, event.target.files)
                            }
                            className={`${fileInputClass} mt-2`}
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

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className={removeButtonClass}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? "Saving..." : "Create Product"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              disabled={loading}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropSource}
        fileName={cropFileName}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}

export default AddProduct;
