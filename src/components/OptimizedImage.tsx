import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean; // If true, adds fetchpriority="high" for LCP images
  lazy?: boolean; // If true (default), adds loading="lazy"
  aspectRatio?: string; // CSS aspect-ratio value, e.g., "9/19.5"
}

/**
 * OptimizedImage component for Core Web Vitals optimization.
 *
 * - Adds loading="lazy" by default for below-fold images
 * - Set priority={true} for hero/LCP images to add fetchpriority="high"
 * - Includes width/height or aspectRatio to prevent CLS
 * - Supports all standard img attributes
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  lazy = true,
  aspectRatio,
  style,
  ...props
}) => {
  const imgStyle: React.CSSProperties = {
    ...style,
    ...(aspectRatio && { aspectRatio }),
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : (lazy ? 'lazy' : undefined)}
      // @ts-expect-error fetchpriority is valid HTML but not in React types yet
      fetchpriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      style={imgStyle}
      {...props}
    />
  );
};

export default OptimizedImage;
