import { useState, useEffect } from "react";
import { OptimizedImage } from "../../..//hooks/useOptimizedImage";

export default function ProductGallery({ images = [], name, fallbackImage }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = images.length > 0 ? images : (fallbackImage ? [fallbackImage] : []);
  const hasImages = allImages.length > 0;
  const hasMultipleImages = allImages.length > 1;

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const selectImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#120422] shadow-2xl">
      <div className="relative aspect-square w-full bg-[#0d021c]">
        {hasImages ? (
          <>
            <OptimizedImage
              src={allImages[currentIndex]}
              alt={`${name} - Image ${currentIndex + 1}`}
              className="h-full w-full object-cover"
              lazy={false}
              quality="auto"
              placeholder={true}
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No Image
          </div>
        )}
      </div>
    </div>
  );
}
