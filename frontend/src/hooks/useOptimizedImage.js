import { useState, useEffect, useRef } from 'react';

/**
 * Hook for optimized image loading with lazy loading and fallbacks
 * @param {string} src - Image source URL
 * @param {object} options - Loading options
 * @returns {object} - Loading state and optimized URLs
 */
export const useOptimizedImage = (src, options = {}) => {
  const {
    lazy = true,
    sizes = '100vw',
    quality = 'auto',
    format = 'auto',
    placeholder = true
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Generate optimized URLs
  const optimizedSrc = src ? getOptimizedImageUrl(src, { quality, format }) : '';
  const placeholderSrc = placeholder && src ? getPlaceholderUrl(src) : '';
  const webpSrc = src ? getWebPUrl(src) : '';

  // Generate srcSet for responsive images
  const srcSet = src ? generateSrcSet(src) : '';

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  return {
    imgRef,
    isLoaded,
    hasError,
    isInView,
    optimizedSrc: isInView ? optimizedSrc : '',
    placeholderSrc,
    webpSrc,
    srcSet,
    sizes,
    handleLoad,
    handleError
  };
};

/**
 * Generate optimized Cloudinary URL
 */
const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;
  const urlParts = url.split('/upload/');

  if (urlParts.length !== 2) return url;

  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
};

/**
 * Generate WebP URL
 */
const getWebPUrl = (url) => {
  return getOptimizedImageUrl(url, { format: 'webp' });
};

/**
 * Generate low-quality placeholder URL
 */
const getPlaceholderUrl = (url) => {
  return getOptimizedImageUrl(url, { width: 50, height: 50, quality: 20, format: 'webp' });
};

/**
 * Generate responsive srcSet
 */
const generateSrcSet = (url) => {
  const sizes = [300, 600, 900, 1200];
  return sizes
    .map(size => `${getOptimizedImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Optimized Image Component with lazy loading and fallbacks
 */
export const OptimizedImage = ({
  src,
  alt,
  className = '',
  lazy = true,
  quality = 'auto',
  format = 'auto',
  sizes = '100vw',
  placeholder = true,
  fallbackSrc = '/placeholder-image.png',
  onError: customOnError,
  ...props
}) => {
  const {
    imgRef,
    isLoaded,
    hasError,
    optimizedSrc,
    placeholderSrc,
    webpSrc,
    srcSet,
    sizes: imageSizes,
    handleLoad,
    handleError
  } = useOptimizedImage(src, { lazy, quality, format, sizes, placeholder });

  const currentSrc = hasError ? fallbackSrc : (optimizedSrc || placeholderSrc);

  const handleImageError = (e) => {
    handleError();
    if (customOnError) customOnError(e);
  };

  return (
    <picture>
      {webpSrc && !hasError && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={srcSet && !hasError ? srcSet : undefined}
        sizes={srcSet && !hasError ? imageSizes : undefined}
        alt={alt}
        className={`${className} ${!isLoaded ? 'blur-sm' : ''} transition-all duration-300`}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleImageError}
        {...props}
      />
    </picture>
  );
};

export default useOptimizedImage;
