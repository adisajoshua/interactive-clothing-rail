import React, { useState } from 'react';
import { Product } from '../data/products';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onClose,
  onPrev,
  onNext,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || ''
  );
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [flipState, setFlipState] = useState<'idle' | 'flipping-out-next' | 'flipping-out-prev' | 'flipping-in-next' | 'flipping-in-prev'>('idle');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Sync color when product changes
  React.useEffect(() => {
    setSelectedColor(product.colors[0]?.name || '');
    setSelectedSize(null);
    setIsAdded(false);
  }, [product]);

  const handleNextWithFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setFlipState('flipping-out-next');
    
    setTimeout(() => {
      onNext();
      setFlipState('flipping-in-next');
      setTimeout(() => {
        setFlipState('idle');
        setIsAnimating(false);
      }, 240);
    }, 200);
  };

  const handlePrevWithFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setFlipState('flipping-out-prev');
    
    setTimeout(() => {
      onPrev();
      setFlipState('flipping-in-prev');
      setTimeout(() => {
        setFlipState('idle');
        setIsAnimating(false);
      }, 240);
    }, 200);
  };

  const handleAdd = () => {
    if (!selectedSize) return;
    onAddToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getFlipTransformStyle = (): React.CSSProperties => {
    switch (flipState) {
      case 'flipping-out-next':
        return {
          transform: 'perspective(1000px) rotateY(-80deg) scale(0.95) skewY(2deg)',
          opacity: 0.15,
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease-in',
        };
      case 'flipping-out-prev':
        return {
          transform: 'perspective(1000px) rotateY(80deg) scale(0.95) skewY(-2deg)',
          opacity: 0.15,
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease-in',
        };
      case 'flipping-in-next':
      case 'flipping-in-prev':
      case 'idle':
      default:
        return {
          transform: 'perspective(1000px) rotateY(0deg) scale(1) skewY(0deg)',
          opacity: 1,
          transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Blurred Backdrop - Click to return to rail */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/15 backdrop-blur-md transition-all duration-300"
      />

      {/* Main Showcase Container */}
      <div className="relative w-full max-w-xl flex flex-col items-center z-10 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-all shadow-sm"
          title="Back to rail"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Garment Showcase with Left & Right 3D Flip Arrows */}
        <div className="relative w-full flex items-center justify-center py-2">
          {/* Left Arrow */}
          <button
            onClick={handlePrevWithFlip}
            disabled={isAnimating}
            className="absolute left-0 sm:left-4 z-20 p-3 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-sm border border-stone-200/60 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            aria-label="Previous garment"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Centered Garment Cutout on Hanger with 3D Flip Swivel & Breeze Settling */}
          <div
            className={`relative h-[380px] sm:h-[420px] flex items-center justify-center ${
              flipState === 'flipping-in-next' || flipState === 'flipping-in-prev'
                ? 'animate-cloth-breeze'
                : ''
            }`}
            style={{
              ...getFlipTransformStyle(),
              transformOrigin: '50% 10px',
            }}
          >
            <img
              src={product.frontImage}
              alt={product.title}
              draggable={false}
              className="h-full w-auto object-contain pointer-events-none"
              style={{
                filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.05))',
              }}
            />
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNextWithFlip}
            disabled={isAnimating}
            className="absolute right-0 sm:right-4 z-20 p-3 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-sm border border-stone-200/60 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            aria-label="Next garment"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 2. E-Commerce Controls Panel */}
        <div className="w-full flex flex-col items-center text-center mt-2 space-y-3">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            {product.title}
          </h2>

          {/* Price only - No stars or reviews */}
          <p className="text-base sm:text-lg font-semibold text-stone-700">
            {product.formattedPrice}
          </p>

          {/* Colorway Swatches */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-stone-500 font-medium">
              Colour: <span className="font-semibold text-stone-800">{selectedColor}</span>
            </span>
            <div className="flex items-center gap-2 ml-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    selectedColor === color.name
                      ? 'ring-2 ring-stone-900 ring-offset-2 scale-110'
                      : 'border-stone-300 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size Pills (XS, S, M, L, XL, XXL) */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/50 rounded-full border border-stone-300/60">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-9 h-8 px-2 rounded-full text-xs font-semibold transition-all ${
                  selectedSize === size
                    ? 'bg-stone-900 text-white shadow-md scale-105'
                    : 'text-stone-700 hover:text-black hover:bg-stone-300/60'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Dynamic Action Button ("Pick a size" -> "Add to bag, £95") */}
          <div className="w-full max-w-xs pt-1">
            <button
              onClick={handleAdd}
              disabled={!selectedSize}
              className={`w-full py-3.5 px-6 rounded-full font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                !selectedSize
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300/60'
                  : isAdded
                  ? 'bg-emerald-700 text-white shadow-lg'
                  : 'bg-stone-900 text-white hover:bg-black shadow-lg hover:shadow-xl active:scale-98'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to bag &bull; {selectedColor} ({selectedSize})</span>
                </>
              ) : selectedSize ? (
                <span>Add to bag, {product.formattedPrice}</span>
              ) : (
                <span>Pick a size</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
