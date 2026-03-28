import { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  storeName?: string;
  className?: string;
  fallbackClassName?: string;
}

function getInitials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

export default function ImageWithFallback({
  src,
  alt,
  storeName,
  className = '',
  fallbackClassName = '',
  ...rest
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const initials = getInitials(storeName || alt || '??');

  if (error || !src) {
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
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
}
