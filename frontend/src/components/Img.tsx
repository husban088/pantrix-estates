import { useState } from 'react';
import { assetUrl } from '../api';
import { FALLBACK_IMG } from '../utils';

export default function Img({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [bad, setBad] = useState(false);
  return (
    <img
      src={bad || !src ? FALLBACK_IMG : assetUrl(src)}
      alt={alt}
      loading="lazy"
      onError={() => setBad(true)}
      className={className}
    />
  );
}
