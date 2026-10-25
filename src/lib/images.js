import { useEffect, useState } from 'react';

// Photos are shipped as WebP (small). If someone later drops in a .jpg with the same name,
// the site quietly falls back to it, so adding photos stays easy.
const jpgVersion = (src) => src.replace(/\.webp$/, '.jpg');

export function loadFirst(src) {
  return new Promise((resolve) => {
    const attempt = (url, next) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => (next ? attempt(next) : resolve(null));
      img.src = url;
    };
    attempt(src, src.endsWith('.webp') ? jpgVersion(src) : null);
  });
}

export function useImageSrc(src) {
  const [current, setCurrent] = useState(src || '');
  const [triedJpg, setTriedJpg] = useState(false);
  useEffect(() => { setCurrent(src || ''); setTriedJpg(false); }, [src]);
  const onError = () => {
    if (!triedJpg && src && src.endsWith('.webp')) { setTriedJpg(true); setCurrent(jpgVersion(src)); }
    else setCurrent('');
  };
  return [current, onError];
}
