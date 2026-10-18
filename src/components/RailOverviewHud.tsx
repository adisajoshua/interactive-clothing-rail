import React from 'react';
import { Product } from '../data/products';

interface RailOverviewHudProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const RailOverviewHud: React.FC<RailOverviewHudProps> = ({
  product,
  onOpenDetail,
}) => {
  return (
    <div className="flex flex-col items-center text-center select-none animate-in fade-in duration-200 pt-3">
      {/* Product Title */}
      <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
        {product.title}
      </h2>

      {/* Price only - No stars or reviews */}
      <p className="text-sm sm:text-base font-semibold text-stone-700 mt-0.5 mb-3">
        {product.formattedPrice}
      </p>

      {/* Video-Accurate "SEE AVAILABILITY" button */}
      <button
        onClick={() => onOpenDetail(product)}
        className="py-2.5 px-8 rounded-full text-xs font-semibold tracking-wider uppercase border border-stone-300/80 bg-white/80 backdrop-blur-sm text-stone-800 hover:bg-stone-900 hover:text-white hover:border-stone-900 shadow-sm transition-all duration-200 active:scale-95"
      >
        See Availability
      </button>
    </div>
  );
};
