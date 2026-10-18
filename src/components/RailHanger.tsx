import React from 'react';
import { Product } from '../data/products';

interface RailHangerProps {
  product: Product;
  index: number;
  isHovered: boolean;
  displacementX: number; // Pixels pushed left or right along the pipe
  swayAngle: number;     // Degrees of pendulum tilt from physical push
  onHover: () => void;
  onSelect: () => void;
}

export const RailHanger: React.FC<RailHangerProps> = ({
  product,
  isHovered,
  displacementX,
  swayAngle,
  onHover,
  onSelect,
}) => {
  return (
    <div
      onMouseEnter={onHover}
      onClick={onSelect}
      className={`relative flex flex-col items-center cursor-pointer select-none flex-shrink-0 ${
        isHovered ? 'animate-cloth-breeze' : ''
      }`}
      style={{
        transform: `translateX(${displacementX}px) rotateZ(${swayAngle}deg)`,
        transformOrigin: '50% 0px', // Pivots from the hook contact point on the pipe
        transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isHovered ? 40 : 20,
      }}
    >
      {/* 
        Width expands smoothly on hover.
        Identical 1:1 scale for both side & front: both use h-[380px] sm:h-[420px].
        NO heavy dark shadows. Pure light ambient drop-shadow.
      */}
      <div
        className={`relative flex items-start justify-center transition-[width] duration-300 ease-out ${
          isHovered ? 'w-[255px] sm:w-[295px]' : 'w-[56px] sm:w-[68px]'
        } h-[390px] sm:h-[410px]`}
      >
        {/* State 1: Narrow Side-Profile Hanging Silhouette */}
        <img
          src={product.sideImage}
          alt={`${product.title} side profile`}
          draggable={false}
          className={`absolute top-0 h-[390px] sm:h-[410px] max-w-none pointer-events-none transition-opacity duration-200 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))',
          }}
        />

        {/* State 2: Unfolded Front-Facing Display */}
        <img
          src={product.frontImage}
          alt={`${product.title} front`}
          draggable={false}
          className={`absolute top-0 h-[390px] sm:h-[410px] max-w-none pointer-events-none transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.06))',
          }}
        />
      </div>
    </div>
  );
};
