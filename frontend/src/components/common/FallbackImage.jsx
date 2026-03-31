import React from 'react';

/**
 * Fallback Image Component with multiple fallback strategies
 */
export const FallbackImage = ({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  errorText = 'Image not available',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        {...props}
      >
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm">{errorText}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`animate-pulse bg-gray-200 ${className}`} {...props}>
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  );
};

/**
 * Generate fallback image URLs based on product data
 */
export const getFallbackImageUrl = (product, type = 'product') => {
  if (!product) return '/placeholder-image.png';

  // Try to use first available image
  if (product.images && product.images.length > 0) {
    return product.images[0].url;
  }

  if (product.image) {
    return product.image;
  }

  // Generate a placeholder based on category
  const category = product.category || 'general';
  return `/placeholders/${category.toLowerCase()}.png`;
};

/**
 * Image with automatic fallback handling
 */
export const SmartImage = ({
  src,
  alt,
  product,
  className = '',
  ...props
}) => {
  const fallbackSrc = getFallbackImageUrl(product);

  return (
    <FallbackImage
      src={src || fallbackSrc}
      alt={alt}
      fallbackSrc={fallbackSrc}
      className={className}
      {...props}
    />
  );
};

export default FallbackImage;