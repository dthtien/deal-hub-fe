import { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  optimizedSrc?: string;
  alt: string;
  storeName?: string;
  className?: string;
  fallbackClassName?: string;
  /** Use eager loading for hero images (DealOfTheDay, DealOfTheWeek) */
  hero?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

function buildSrcSet(url: string): string | undefined {
  if (!url.includes('width=400')) return undefined;
  const url2x = url.replace('width=400', 'width=800');
  return `${url} 1x, ${url2x} 2x`;
}

export default function ImageWithFallback({
  src,
  optimizedSrc,
  alt,
  storeName,
  className = '',
  fallbackClassName = '',
  hero = false,
  ...rest
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const initials = getInitials(storeName || alt || '??');

  const effectiveSrc = optimizedSrc || src;
  const srcSet = effectiveSrc ? buildSrcSet(effectiveSrc) : undefined;

  if (error || !effectiveSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-orange-500 text-white font-bold select-none ${fallbackClassName || className}`}
        aria-label={alt}
      >
        <span className="text-sm">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={effectiveSrc}
      srcSet={srcSet}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading={hero ? 'eager' : 'lazy'}
      decoding="async"
      sizes="(max-width: 640px) 100vw, 50vw"
      {...rest}
    />
  );
}
