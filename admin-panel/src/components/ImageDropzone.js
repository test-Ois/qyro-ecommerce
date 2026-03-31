import { useRef, useState } from "react";

function ImageDropzone({ onImagesSelect, currentImages = [], isUploading = false }) {

  // Show existing images as default previews (used in EditProductModal)
  const [previews, setPreviews] = useState(currentImages.map(img => img.url || img));
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef();

  /* Validate and add files */
  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Only image files are allowed`);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size too large (max 5MB)`);
        return;
      }

      // Check image dimensions (optional - for better UX)
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          errors.push(`${file.name}: Image too small (min 100x100px)`);
        }
      };
      img.src = URL.createObjectURL(file);

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      alert(`Upload errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    // Limit to 10 total images
    const remainingSlots = 10 - previews.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    onImagesSelect(filesToAdd);
  };

  /* Highlight dropzone on drag over */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  /* Remove highlight on drag leave */
  const handleDragLeave = () => {
    setDragging(false);
  };

  /* Extract dropped files and process */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  /* Remove image preview */
  const removeImage = (index) => {
    setPreviews(prev => {
      // Revoke object URL for newly uploaded images
      if (index >= currentImages.length) {
        URL.revokeObjectURL(prev[index]);
      }
      return prev.filter((_, i) => i !== index);
    });
    onImagesSelect(null, index); // Signal removal
  };

  return (

    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      style={{
        border: `2px dashed ${dragging ? "#4f46e5" : "#ccc"}`,
        borderRadius: "10px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? "#f0f0ff" : "#fafafa",
        transition: "all 0.2s",
        marginBottom: "10px",
        marginTop: "10px",
        width: "fit-content",
        minWidth: "300px",
        maxWidth: "500px",
      }}
    >

      {/* Hidden file input — triggered on click */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Show instructions */}
      <p style={{ color: "#888", margin: 0 }}>
        {isUploading ? `Uploading... ${uploadProgress}%` : dragging
          ? "Drop images here..."
          : `Drag & drop product images here, or click to select (${previews.length}/10)`}
      </p>

      {/* Progress bar */}
      {isUploading && (
        <div style={{
          width: "100%",
          height: "4px",
          background: "#eee",
          borderRadius: "2px",
          marginTop: "10px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${uploadProgress}%`,
            height: "100%",
            background: "#4f46e5",
            transition: "width 0.3s ease"
          }} />
        </div>
      )}

      {/* Show previews if images selected */}
      {previews.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "10px",
            maxWidth: "400px",
            margin: "0 auto"
          }}>
            {previews.map((preview, index) => (
              <div key={index} style={{ position: "relative" }}>
                <img
                  src={preview}
                  alt={`preview ${index + 1}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
                {index === 0 && (
                  <div style={{
                    position: "absolute",
                    bottom: "2px",
                    left: "2px",
                    background: "gold",
                    color: "black",
                    fontSize: "10px",
                    padding: "2px 4px",
                    borderRadius: "4px"
                  }}>
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>

  );

}

export default ImageDropzone;