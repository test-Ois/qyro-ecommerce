import { useState, useEffect } from "react";
import API from "../services/api";
import ProductForm from "./ProductForm";

function EditProductModal({ product, onClose, fetchProducts }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [stock, setStock] = useState("");

  const [isBanner, setIsBanner] = useState(false);
  const [isSideBanner, setIsSideBanner] = useState(false);
  const [isDeal, setIsDeal] = useState(false);
  const [bannerType, setBannerType] = useState("none");
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price || "");
      setCategory(product.category || "");
      setDescription(product.description || "");
      setStock(product.stock || 0);

      setIsBanner(product.isBanner || false);
      setIsSideBanner(product.isSideBanner || false);
      setIsDeal(product.isDeal || false);
      setBannerType(product.bannerType || "none");
      setVariants(product.variants || []);

      // Handle images - prefer new images array, fallback to legacy image
      const productImages = product.images || [];
      const legacyImage = product.image;
      const allImages = productImages.length > 0 ? productImages :
        (legacyImage ? [{ url: legacyImage, type: "main" }] : []);

      setCurrentImages(allImages);
      setImages([]); // Start with empty new images
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("stock", stock);

      formData.append("isBanner", isBanner);
      formData.append("isSideBanner", isSideBanner);
      formData.append("isDeal", isDeal);
      formData.append("bannerType", bannerType);
      formData.append("variants", JSON.stringify(variants));

      // Append new images
      images.forEach((img) => {
        formData.append("images", img);
      });

      await API.put(`/products/${product._id}`, formData);

      alert("Product Updated ✅");
      fetchProducts();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  if (!product) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "8px",
        minWidth: "350px",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <h3>Edit Product</h3>

        <form onSubmit={handleSubmit}>
          <ProductForm
            name={name} setName={setName}
            price={price} setPrice={setPrice}
            category={category} setCategory={setCategory}
            description={description} setDescription={setDescription}
            stock={stock} setStock={setStock}
            images={images} setImages={setImages}
            isBanner={isBanner} setIsBanner={setIsBanner}
            isSideBanner={isSideBanner} setIsSideBanner={setIsSideBanner}
            isDeal={isDeal} setIsDeal={setIsDeal}
            bannerType={bannerType} setBannerType={setBannerType}
            currentImages={currentImages}
            variants={variants}
            setVariants={setVariants}
          />

          <div style={{ marginTop: "15px" }}>
            <button type="submit">Update Product</button>
            <button
              type="button"
              onClick={onClose}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;