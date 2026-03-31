import { useState } from "react";
import API from "../services/api";
import ProductForm from "./ProductForm";

function AddProductModal({ onClose, fetchProducts }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);

  const [isBanner, setIsBanner] = useState(false);
  const [isSideBanner, setIsSideBanner] = useState(false);
  const [isDeal, setIsDeal] = useState(false);
  const [bannerType, setBannerType] = useState("none");

  const [variants, setVariants] = useState([
    {
      size: "",
      color: "",
      price: "",
      stock: "",
      sku: "",
      image: ""
    }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("At least one product image is required");
      return;
    }

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

      // Prepare variants data without images (images will be handled separately)
      const variantsWithoutImages = variants.map(variant => ({
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock: variant.stock,
        sku: variant.sku,
        image: variant.image
      }));

      formData.append("variants", JSON.stringify(variantsWithoutImages));

      // Prepare variant images data
      const variantImagesData = variants.map(variant => ({
        images: variant.images || []
      }));
      formData.append("variantImages", JSON.stringify(variantImagesData));

      // Append product images
      images.forEach((img) => {
        formData.append("images", img);
      });

      // Append variant images with proper field names
      variants.forEach((variant, variantIndex) => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach((img, imgIndex) => {
            formData.append(`variant_${variantIndex}_images`, img);
          });
        }
      });

      await API.post("/products", formData);

      alert("Product Added ✅");
      fetchProducts();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Product add failed");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h3>Add Product</h3>

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
          currentImage=""
          variants={variants}
          setVariants={setVariants}
        />

        <br />
        <button type="submit">Add Product</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}

export default AddProductModal;