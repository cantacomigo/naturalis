import React, { useState } from 'react';
import logoAsset from '../assets/images/logo.png';

interface NaturalisLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'badge' | 'compact' | 'full';
  priority?: boolean;
}

export const NaturalisLogo: React.FC<NaturalisLogoProps> = ({
  className = '',
  size,
  priority = false,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(logoAsset || '/logo.png');
  const style = size ? { width: size, height: size } : undefined;

  const handleError = () => {
    if (imgSrc !== '/logo.png') {
      setImgSrc('/logo.png');
    } else {
      setImgSrc('/images/Logo.png');
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={style}
    >
      <img
        src={imgSrc}
        alt="Naturalis Gourmet"
        className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
        loading={priority ? 'eager' : 'lazy'}
        onError={handleError}
      />
    </div>
  );
};
